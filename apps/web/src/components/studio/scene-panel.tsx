"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSceneStore } from "@/store/scene-store";
import { ShotPreviewModal } from "./shot-preview-modal";
import type { Shot } from "@keyframe/types";

const mi = (name: string, spin = false) => (
  <span className={`material-symbols-rounded text-[16px]${spin ? " animate-spin" : ""}`}>{name}</span>
);

const STATUS_CONFIG: Record<Shot["status"], { label: string; color: string; icon: React.ReactNode }> = {
  idle:             { label: "Idle",    color: "text-white/30",      icon: mi("schedule") },
  image_pending:    { label: "Queued",  color: "text-yellow-400/60", icon: mi("progress_activity", true) },
  image_processing: { label: "Image…",  color: "text-orange-400",    icon: mi("progress_activity", true) },
  video_pending:    { label: "Queued",  color: "text-yellow-400/60", icon: mi("progress_activity", true) },
  video_processing: { label: "Video…",  color: "text-blue-400",      icon: mi("progress_activity", true) },
  completed:        { label: "Done",    color: "text-green-400",      icon: mi("check_circle") },
  failed:           { label: "Failed",  color: "text-red-400",        icon: mi("cancel") },
};

interface ScenePanelProps {
  projectId: string;
  /** When true, renders without the outer border/bg — used inside StudioLeftPanel */
  embedded?: boolean;
}

export function ScenePanel({ projectId, embedded = false }: ScenePanelProps) {
  const { scenes, isLoading, loadScenes, subscribeRealtime } = useSceneStore();
  const [previewShot, setPreviewShot] = useState<Shot | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleRegenerate = async (e: React.MouseEvent, shot: Shot) => {
    e.stopPropagation();
    setRegeneratingId(shot.id);
    const tid = toast.loading(`Regenerating "${shot.title}"…`);
    try {
      const res = await fetch(`/api/shots/${shot.id}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Regeneration failed");
      toast.success("Shot queued for regeneration", { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Regeneration failed", { id: tid });
    } finally {
      setRegeneratingId(null);
    }
  };

  // Flat list of all shots for prev/next navigation
  const allShots = scenes.flatMap((s) => s.shots);
  const previewIdx = previewShot ? allShots.findIndex((s) => s.id === previewShot.id) : -1;

  useEffect(() => {
    loadScenes(projectId);
    const unsub = subscribeRealtime(projectId);
    return unsub;
  }, [projectId, loadScenes, subscribeRealtime]);

  // Keep preview shot data fresh from store
  useEffect(() => {
    if (!previewShot) return;
    const fresh = allShots.find((s) => s.id === previewShot.id);
    if (fresh) setPreviewShot(fresh);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes]);

  const wrapper = embedded
    ? "flex flex-1 flex-col overflow-hidden"
    : "flex w-80 shrink-0 flex-col border-r border-white/10 bg-[#0a0a12]";

  return (
    <>
      <aside className={wrapper}>
        {!embedded && (
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Scenes</p>
            {isLoading && <span className="material-symbols-rounded text-[16px] animate-spin text-white/30">progress_activity</span>}
          </div>
        )}
        {embedded && isLoading && (
          <div className="flex justify-end px-3 py-1">
            <span className="material-symbols-rounded text-[16px] animate-spin text-white/30">progress_activity</span>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-3">
          {scenes.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="material-symbols-rounded text-[28px] text-white/10">movie</span>
              <p className="text-xs leading-relaxed text-white/25">
                Use the Director bar above to generate a shot plan
              </p>
            </div>
          )}

          {scenes.map((scene, si) => (
            <div key={scene.id} className="flex flex-col gap-2">
              {/* Scene heading */}
              <div className="flex items-center gap-2.5 px-0.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white/40 ring-1 ring-white/10">
                  {si + 1}
                </span>
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-white/40">{scene.title}</p>
              </div>

              {/* Shot list */}
              <div className="flex flex-col gap-1.5">
                {scene.shots.map((shot) => {
                  const cfg = STATUS_CONFIG[shot.status];
                  return (
                    <button
                      key={shot.id}
                      onClick={() => setPreviewShot(shot)}
                      className="group/shot flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2 text-left transition-colors hover:border-white/10 hover:bg-white/[0.05]"
                    >
                      {/* Thumbnail */}
                      {shot.video_url ? (
                        <video src={shot.video_url} className="h-9 w-16 shrink-0 rounded-md object-cover" muted loop autoPlay />
                      ) : shot.image_url ? (
                        <img src={shot.image_url} alt={shot.title} className="h-9 w-16 shrink-0 rounded-md object-cover" />
                      ) : (
                        <div className="h-9 w-16 shrink-0 rounded-md bg-white/[0.04]" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white/65">{shot.title}</p>
                        <div className={`mt-0.5 flex items-center gap-1 ${cfg.color}`}>
                          {cfg.icon}
                          <span className="text-[10px]">{cfg.label}</span>
                        </div>
                      </div>

                      {(shot.status === "completed" || shot.status === "failed") && (
                        <button
                          onClick={(e) => handleRegenerate(e, shot)}
                          disabled={regeneratingId === shot.id}
                          className="shrink-0 rounded-lg p-1 text-white/20 opacity-0 transition-opacity hover:bg-white/5 hover:text-white/60 group-hover/shot:opacity-100 disabled:cursor-not-allowed"
                          title="Regenerate shot"
                        >
                          <span className={`material-symbols-rounded text-[15px] ${regeneratingId === shot.id ? "animate-spin" : ""}`}>refresh</span>
                        </button>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <ShotPreviewModal
        shot={previewShot}
        onClose={() => setPreviewShot(null)}
        onPrev={previewIdx > 0 ? () => setPreviewShot(allShots[previewIdx - 1]) : undefined}
        onNext={previewIdx < allShots.length - 1 ? () => setPreviewShot(allShots[previewIdx + 1]) : undefined}
      />
    </>
  );
}
