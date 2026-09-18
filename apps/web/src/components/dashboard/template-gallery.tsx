"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { Template } from "@keyframe/types";

const CATEGORY_COLORS: Record<string, string> = {
  Commercial:    "bg-blue-500/10 text-blue-400",
  Entertainment: "bg-violet-500/10 text-violet-400",
  Documentary:   "bg-green-500/10 text-green-400",
};

const CATEGORY_ICONS: Record<string, string> = {
  Commercial: "📺",
  Entertainment: "🎬",
  Documentary: "🎥",
};

interface TemplateGalleryProps {
  templates: Template[];
}

export function TemplateGallery({ templates }: TemplateGalleryProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUse = async (template: Template) => {
    setLoadingId(template.id);
    const tid = toast.loading(`Setting up "${template.title}"…`);
    try {
      const res = await fetch("/api/templates/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load template");
      toast.success("Project created — Director is planning your shots…", { id: tid });
      window.location.href = `/studio/${data.projectId}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
      setLoadingId(null);
    }
  };

  if (!templates.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-violet-400" />
        <h2 className="text-lg font-semibold">Start from a template</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {templates.map((t) => {
          const snap = t.graph_snapshot as Record<string, unknown>;
          const duration = snap?.totalDuration as number | undefined;
          const scenes = snap?.numScenes as number | undefined;

          return (
            <button
              key={t.id}
              onClick={() => handleUse(t)}
              disabled={loadingId === t.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.04] disabled:opacity-60"
            >
              {/* Thumbnail placeholder */}
              <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-violet-900/20 to-black text-3xl">
                {CATEGORY_ICONS[t.category] ?? "🎬"}
              </div>

              <div className="flex flex-col gap-1.5 p-3">
                <p className="truncate text-xs font-medium text-white/80">{t.title}</p>

                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${CATEGORY_COLORS[t.category] ?? "bg-white/5 text-white/40"}`}>
                    {t.category}
                  </span>
                  {duration && <span className="text-[9px] text-white/30">{duration}s</span>}
                  {scenes && <span className="text-[9px] text-white/20">· {scenes} scenes</span>}
                </div>
              </div>

              {/* Loading overlay */}
              {loadingId === t.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
