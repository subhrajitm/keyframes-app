"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { toast } from "sonner";
import { NodeWrapper } from "./node-wrapper";
import { useSceneStore } from "@/store/scene-store";
import type { KFNode } from "@/store/project-store";

const STATUS_LABEL: Record<string, string> = {
  idle:             "Ready",
  image_pending:    "Queued",
  image_processing: "Generating…",
  video_pending:    "Image done",
  video_processing: "Animating…",
  completed:        "Done",
  failed:           "Failed",
};

export const ImageGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const [isTriggering, setIsTriggering] = useState(false);

  // Look up this node's shot from the scene store via node_id
  const shot = useSceneStore((s) =>
    s.scenes.flatMap((sc) => sc.shots).find((sh) => sh.node_id === id)
  );

  const shotStatus = shot?.status ?? "idle";
  const imageUrl = shot?.image_url ?? data.outputUrl;
  const isProcessing = ["image_pending", "image_processing", "video_pending", "video_processing"].includes(shotStatus);
  const isDone = shotStatus === "completed" || shotStatus === "video_processing" || shotStatus === "video_pending";

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shot?.id || isTriggering || isProcessing) return;
    setIsTriggering(true);
    const tid = toast.loading("Queuing shot…");
    try {
      const res = await fetch(`/api/shots/${shot.id}/regenerate`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Shot queued", { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <NodeWrapper id={id} accentColor="#f97316" icon="image" title="Image Gen">
      <Handle type="target" position={Position.Left} id="character-in" style={{ top: "35%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-violet-500 !bg-[#0f0f1a]" />
      <Handle type="target" position={Position.Left} id="location-in" style={{ top: "55%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-[#0f0f1a]" />
      <Handle type="target" position={Position.Left} id="prompt-in" style={{ top: "75%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-[#0f0f1a]" />

      <div className="flex flex-col gap-2">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20">
          {imageUrl ? (
            <img src={imageUrl} alt="Generated" className="h-full w-full object-cover" />
          ) : isProcessing ? (
            <span className="material-symbols-rounded text-[24px] animate-spin text-orange-400">progress_activity</span>
          ) : (
            <span className="material-symbols-rounded text-[24px] text-orange-400/40">image</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${
              shotStatus === "completed" ? "bg-green-400"
              : shotStatus === "failed" ? "bg-red-400"
              : isProcessing ? "animate-pulse bg-orange-400"
              : "bg-white/20"
            }`} />
            <span className="text-xs text-white/50">{STATUS_LABEL[shotStatus] ?? "Ready"}</span>
          </div>

          {shot && !isProcessing && (
            <button
              onClick={handleGenerate}
              disabled={isTriggering}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-white/30 transition-colors hover:bg-orange-500/10 hover:text-orange-300 disabled:opacity-40"
              title={isDone ? "Regenerate" : "Generate"}
            >
              <span className={`material-symbols-rounded text-[12px] ${isTriggering ? "animate-spin" : ""}`}>refresh</span>
              {isDone ? "Regen" : "Gen"}
            </button>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="image-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-[#0f0f1a]" />
    </NodeWrapper>
  );
});

ImageGenNode.displayName = "ImageGenNode";
