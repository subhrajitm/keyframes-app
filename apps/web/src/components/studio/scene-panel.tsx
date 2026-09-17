"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, Film, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSceneStore } from "@/store/scene-store";
import { ShotPreviewModal } from "./shot-preview-modal";
import type { Shot } from "@keyframe/types";

const STATUS_CONFIG: Record<Shot["status"], { label: string; color: string; icon: React.ReactNode }> = {
  idle:             { label: "Idle",    color: "text-white/30",     icon: <Clock className="h-3 w-3" /> },
  image_pending:    { label: "Queued",  color: "text-yellow-400/60",icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  image_processing: { label: "Image…",  color: "text-orange-400",   icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  video_pending:    { label: "Queued",  color: "text-yellow-400/60",icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  video_processing: { label: "Video…",  color: "text-blue-400",     icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  completed:        { label: "Done",    color: "text-green-400",     icon: <CheckCircle2 className="h-3 w-3" /> },
  failed:           { label: "Failed",  color: "text-red-400",       icon: <XCircle className="h-3 w-3" /> },
};

interface ScenePanelProps {
  projectId: string;
}

export function ScenePanel({ projectId }: ScenePanelProps) {
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

  return (
    <>
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0a12]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Scenes</p>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-white/30" />}
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
          {scenes.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Film className="h-6 w-6 text-white/10" />
              <p className="text-[10px] text-white/20">
                Use the Director bar above to generate a shot plan
              </p>
            </div>
          )}

          {scenes.map((scene, si) => (
            <div key={scene.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-1 pt-1">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white/30 ring-1 ring-white/10">
                  {si + 1}
                </span>
                <p className="truncate text-[11px] font-medium text-white/60">{scene.title}</p>
              </div>

              {scene.shots.map((shot) => {
                const cfg = STATUS_CONFIG[shot.status];
                return (
                  <button
                    key={shot.id}
                    onClick={() => setPreviewShot(shot)}
                    className="group/shot flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1.5 text-left transition-colors hover:border-white/10 hover:bg-white/[0.06]"
                  >
                    {shot.video_url ? (
                      <video src={shot.video_url} className="h-8 w-14 shrink-0 rounded object-cover" muted loop autoPlay />
                    ) : shot.image_url ? (
                      <img src={shot.image_url} alt={shot.title} className="h-8 w-14 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-14 shrink-0 rounded bg-white/5" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-white/60">{shot.title}</p>
                      <div className={`flex items-center gap-1 ${cfg.color}`}>
                        {cfg.icon}
                        <span className="text-[9px]">{cfg.label}</span>
                      </div>
                    </div>

                    {/* Regenerate button — show on hover for completed/failed */}
                    {(shot.status === "completed" || shot.status === "failed") && (
                      <button
                        onClick={(e) => handleRegenerate(e, shot)}
                        disabled={regeneratingId === shot.id}
                        className="shrink-0 rounded p-0.5 text-white/20 opacity-0 transition-opacity hover:text-white/60 group-hover/shot:opacity-100 disabled:cursor-not-allowed"
                        title="Regenerate shot"
                      >
                        <RefreshCw className={`h-3 w-3 ${regeneratingId === shot.id ? "animate-spin" : ""}`} />
                      </button>
                    )}
                  </button>
                );
              })}
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
