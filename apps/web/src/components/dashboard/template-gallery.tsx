"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Template } from "@keyframe/types";

const CATEGORY_COLOR: Record<string, { from: string; via: string }> = {
  Commercial:    { from: "#1e3a5f", via: "#0f2340" },
  Entertainment: { from: "#2d1b69", via: "#1a0f3d" },
  Documentary:   { from: "#0f3d2a", via: "#0a2419" },
};

const CATEGORY_ICON: Record<string, string> = {
  Commercial:    "tv",
  Entertainment: "movie",
  Documentary:   "video_camera_back",
};

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  Commercial:    "rgba(30,90,140,0.35)",
  Entertainment: "rgba(80,40,160,0.35)",
  Documentary:   "rgba(20,100,60,0.35)",
};

interface Props {
  templates: Template[];
}

export function TemplateGallery({ templates }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function scrollBy(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });
  }

  async function handleUse(template: Template) {
    setLoadingId(template.id);
    const tid = toast.loading(`Setting up "${template.title}"…`);
    try {
      const res = await fetch("/api/templates/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json() as { projectId?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Template loaded — use the Director bar to plan your shots", { id: tid });
      router.push(`/studio/${data.projectId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
      setLoadingId(null);
    }
  }

  if (!templates.length) return null;

  return (
    <section>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Templates</h2>
          <p className="mt-0.5 text-sm text-white/40">Start from a pre-built film concept</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollBy(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-rounded text-[18px]">chevron_left</span>
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-rounded text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {templates.map((t) => {
          const snap = t.graph_snapshot as Record<string, unknown>;
          const duration = snap?.totalDuration as number | undefined;
          const numScenes = snap?.numScenes as number | undefined;
          const style = snap?.style as string | undefined;
          const icon = CATEGORY_ICON[t.category] ?? "movie";
          const colors = CATEGORY_COLOR[t.category] ?? { from: "#1a1a2e", via: "#111120" };
          const badgeColor = CATEGORY_BADGE_COLOR[t.category] ?? "rgba(40,40,60,0.4)";

          // Extract up to 2 style keywords
          const styleTags = style
            ? style.split(/[,.]/).map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 2)
            : [];

          const isLoading = loadingId === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleUse(t)}
              disabled={isLoading}
              className="group relative flex-none w-64 overflow-hidden rounded-lg border border-white/[0.08] bg-[#111111] text-left transition-colors hover:border-white/20 disabled:opacity-60"
            >
              {/* ── Thumbnail area ── */}
              <div
                className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.from}, ${colors.via} 60%, #080808)`,
                }}
              >
                {/* Large centered icon */}
                <span className="material-symbols-rounded text-[56px] text-white/10 transition-colors group-hover:text-white/15">
                  {icon}
                </span>

                {/* Category chip — top left */}
                {t.is_featured && (
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm">
                    <span className="material-symbols-rounded text-[10px] text-emerald-400">star</span>
                    <span className="text-[10px] font-semibold text-emerald-400">Featured</span>
                  </div>
                )}

                {/* Use / loading — top right */}
                <div className="absolute right-2.5 top-2.5">
                  {isLoading ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50">
                      <span className="material-symbols-rounded animate-spin text-[16px] text-white/60">progress_activity</span>
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="material-symbols-rounded text-[16px] text-white/80">arrow_forward</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Content area ── */}
              <div className="p-3">
                {/* Title row */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                  >
                    <span className="material-symbols-rounded text-[12px] text-white/40">{icon}</span>
                  </div>
                  <p className="min-w-0 truncate text-sm font-semibold text-white/90">{t.title}</p>
                </div>

                {/* Description */}
                <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/40">
                  {t.description}
                </p>

                {/* Style tags */}
                {styleTags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {styleTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-1.5 py-0.5 text-[10px] text-white/45"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom category + meta badge */}
                <div className="mt-3 flex items-center justify-between">
                  <div
                    className="flex items-center gap-1.5 rounded px-2 py-1"
                    style={{ backgroundColor: badgeColor, border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="material-symbols-rounded text-[12px] text-white/50">{icon}</span>
                    <span className="text-[11px] text-white/55">{t.category}</span>
                    <span className="material-symbols-rounded text-[12px] text-white/25">open_in_new</span>
                  </div>

                  {(duration || numScenes) && (
                    <div className="flex items-center gap-2 text-[10px] text-white/25">
                      {numScenes && <span>{numScenes} scenes</span>}
                      {duration && <span>{duration}s</span>}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
