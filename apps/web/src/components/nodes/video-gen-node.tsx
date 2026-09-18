"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import { useSceneStore } from "@/store/scene-store";
import type { KFNode } from "@/store/project-store";

const STATUS_LABEL: Record<string, string> = {
  idle:             "Waiting for image",
  image_pending:    "Image queued",
  image_processing: "Image generating…",
  video_pending:    "Queued…",
  video_processing: "Animating…",
  completed:        "Complete",
  failed:           "Failed",
};

export const VideoGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const imageNodeId = id.replace(/_vid$/, "_img");

  const shot = useSceneStore((s) =>
    s.scenes.flatMap((sc) => sc.shots).find((sh) => sh.node_id === imageNodeId)
  );

  const status = shot?.status ?? "idle";
  const videoUrl = shot?.video_url ?? (data.outputUrl as string | undefined);
  const isProcessing = ["video_pending", "video_processing"].includes(status);

  const dotCls =
    status === "completed" ? "bg-emerald-400"
    : status === "failed" ? "bg-red-400"
    : isProcessing ? "animate-pulse bg-red-400"
    : "bg-white/20";

  return (
    <NodeWrapper
      id={id}
      title="Video Gen"
      icon="movie"
      avatarColor="#ef4444"
      avatarIcon="movie"
      imageSlot={
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-white/[0.025]">
          {videoUrl ? (
            <video
              src={videoUrl}
              className="h-full w-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : isProcessing ? (
            <span className="material-symbols-rounded animate-spin text-[28px] text-white/15">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-rounded text-[32px] text-white/[0.07]">movie</span>
          )}
        </div>
      }
    >
      <Handle type="target" position={Position.Left} id="image-in" style={{ top: "38%" }}
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#0d1018]" />
      <Handle type="target" position={Position.Left} id="prompt-in" style={{ top: "62%" }}
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#0d1018]" />

      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
        <span className="text-[11px] text-white/35">{STATUS_LABEL[status] ?? "Ready"}</span>
      </div>

      <Handle type="source" position={Position.Right} id="video-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#0d1018]" />
    </NodeWrapper>
  );
});

VideoGenNode.displayName = "VideoGenNode";
