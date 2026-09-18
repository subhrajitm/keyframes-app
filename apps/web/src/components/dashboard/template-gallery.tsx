"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Template } from "@keyframe/types";

const CATEGORY_GRADIENT: Record<string, string> = {
  Commercial:    "from-blue-900/80 via-blue-800/40 to-slate-900",
  Entertainment: "from-violet-900/80 via-purple-800/40 to-slate-900",
  Documentary:   "from-green-900/80 via-emerald-800/40 to-slate-900",
};

const CATEGORY_ICON: Record<string, string> = {
  Commercial:    "tv",
  Entertainment: "movie",
  Documentary:   "video_camera_back",
};

interface Props {
  templates: Template[];
}

export function TemplateGallery({ templates }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function scrollBy(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ left: dir * 500, behavior: "smooth" });
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Project created — Director is planning your shots…", { id: tid });
      window.location.href = `/studio/${data.projectId}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
      setLoadingId(null);
    }
  }

  if (!templates.length) return null;

  return (
    <section>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Get Inspired</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">All Templates</span>
          <button
            onClick={() => scrollBy(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-rounded text-[18px]">chevron_left</span>
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-rounded text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {templates.map((t) => {
          const snap = t.graph_snapshot as Record<string, unknown>;
          const duration = snap?.totalDuration as number | undefined;
          const gradient = CATEGORY_GRADIENT[t.category] ?? "from-gray-800/80 via-gray-700/40 to-slate-900";
          const icon = CATEGORY_ICON[t.category] ?? "movie";

          return (
            <button
              key={t.id}
              onClick={() => handleUse(t)}
              disabled={loadingId === t.id}
              className="group relative flex-none w-56 overflow-hidden rounded-2xl text-left transition-transform hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60"
            >
              {/* Background gradient */}
              <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="material-symbols-rounded text-[40px] text-white/20 group-hover:text-white/30 transition-colors">
                  {icon}
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
                <p className="text-sm font-semibold leading-tight">{t.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-white/40">{t.category}</span>
                  {duration && <span className="text-xs text-white/25">· {duration}s</span>}
                </div>
              </div>

              {loadingId === t.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                  <span className="material-symbols-rounded text-[28px] animate-spin">progress_activity</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
