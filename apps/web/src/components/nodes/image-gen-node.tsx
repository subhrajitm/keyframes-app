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
  const [isSwitching, setIsSwitching] = useState(false);
  const updateShotStatus = useSceneStore((s) => s.updateShotStatus);

  const shot = useSceneStore((s) =>
    s.scenes.flatMap((sc) => sc.shots).find((sh) => sh.node_id === id)
  );

  const status = shot?.status ?? "idle";
  const imageUrl = shot?.image_url ?? (data.outputUrl as string | undefined);
  const variationUrls: string[] = shot?.variation_urls ?? [];
  const isProcessing = ["image_pending", "image_processing", "video_pending", "video_processing"].includes(status);

  const handleSelectVariation = async (index: number) => {
    if (!shot?.id || isSwitching) return;
    setIsSwitching(true);
    try {
      const res = await fetch(`/api/shots/${shot.id}/select-variation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variationIndex: index }),
      });
      const d = await res.json() as { imageUrl?: string; error?: string };
      if (!res.ok) throw new Error(d.error ?? "Failed");
      updateShotStatus(shot.id, { image_url: d.imageUrl ?? null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to switch variation");
    } finally {
      setIsSwitching(false);
    }
  };

  const dotCls =
    status === "completed" ? "bg-emerald-400"
    : status === "failed" ? "bg-red-400"
    : isProcessing ? "animate-pulse bg-rose-400"
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
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotCls}`} />
          <span className="text-[11px] text-white/35">{STATUS_LABEL[status] ?? "Ready"}</span>
        </div>

        {shot && !isProcessing && (
          <button
            onClick={handleRegen}
            disabled={isBusy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60 disabled:opacity-40"
          >
            <span className={`material-symbols-rounded text-[12px] ${isBusy ? "animate-spin" : ""}`}>
              refresh
            </span>
            {status === "completed" ? "Regen" : "Generate"}
          </button>
        )}
      </div>

      {/* Variation picker */}
      {variationUrls.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {variationUrls.map((url, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); handleSelectVariation(i); }}
              disabled={isSwitching}
              className={`relative shrink-0 overflow-hidden rounded transition-all ${
                url === imageUrl
                  ? "ring-2 ring-white/60"
                  : "ring-1 ring-white/10 opacity-60 hover:opacity-100"
              }`}
              style={{ width: 44, height: 28 }}
            >
              <img src={url} alt={`v${i + 1}`} className="h-full w-full object-cover" />
              <span className="absolute bottom-0 left-0 rounded-tr bg-black/70 px-0.5 text-[8px] text-white/70">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} id="image-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]" />
    </NodeWrapper>
  );
});

ImageGenNode.displayName = "ImageGenNode";
