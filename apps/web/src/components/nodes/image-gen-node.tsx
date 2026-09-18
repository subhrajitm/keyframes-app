"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { toast } from "sonner";
import { NodeWrapper } from "./node-wrapper";
import { useSceneStore } from "@/store/scene-store";
import type { KFNode } from "@/store/project-store";

const STATUS_LABEL: Record<string, string> = {
  idle:             "Ready to generate",
  image_pending:    "Queued…",
  image_processing: "Generating image…",
  video_pending:    "Image ready",
  video_processing: "Animating…",
  completed:        "Complete",
  failed:           "Failed",
};

export const ImageGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const [isBusy, setIsBusy] = useState(false);

  const shot = useSceneStore((s) =>
    s.scenes.flatMap((sc) => sc.shots).find((sh) => sh.node_id === id)
  );

  const status = shot?.status ?? "idle";
  const imageUrl = shot?.image_url ?? (data.outputUrl as string | undefined);
  const isProcessing = ["image_pending", "image_processing", "video_pending", "video_processing"].includes(status);

  const dotCls =
    status === "completed" ? "bg-emerald-400"
    : status === "failed" ? "bg-red-400"
    : isProcessing ? "animate-pulse bg-violet-400"
    : "bg-white/20";

  const handleRegen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shot?.id || isBusy || isProcessing) return;
    setIsBusy(true);
    const tid = toast.loading("Queuing shot…");
    try {
      const res = await fetch(`/api/shots/${shot.id}/regenerate`, { method: "POST" });
      const d = await res.json() as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Shot queued", { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <NodeWrapper
      id={id}
      title="Image Gen"
      icon="image"
      avatarColor="#7c3aed"
      avatarIcon="image"
      imageSlot={
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-white/[0.025]">
          {imageUrl ? (
            <img src={imageUrl} alt="Generated" className="h-full w-full object-cover" />
          ) : isProcessing ? (
            <span className="material-symbols-rounded animate-spin text-[28px] text-white/15">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-rounded text-[32px] text-white/[0.07]">image</span>
          )}
        </div>
      }
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} id="character-in" style={{ top: "28%" }}
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]" />
      <Handle type="target" position={Position.Left} id="location-in" style={{ top: "50%" }}
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]" />
      <Handle type="target" position={Position.Left} id="prompt-in" style={{ top: "72%" }}
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]" />

      {/* Status + regen */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
          <span className="text-[11px] text-white/35">{STATUS_LABEL[status] ?? "Ready"}</span>
        </div>

        {shot && !isProcessing && (
          <button
            onClick={handleRegen}
            disabled={isBusy}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60 disabled:opacity-40"
          >
            <span className={`material-symbols-rounded text-[12px] ${isBusy ? "animate-spin" : ""}`}>
              refresh
            </span>
            {status === "completed" ? "Regen" : "Generate"}
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="image-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]" />
    </NodeWrapper>
  );
});

ImageGenNode.displayName = "ImageGenNode";
