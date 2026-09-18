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
  video_pending:    "Video queued",
  video_processing: "Animating…",
  completed:        "Done",
  failed:           "Failed",
};

export const VideoGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  // VideoGen node ID pattern: s{si}_sh{shi}_vid — derive the matching shot's node_id
  const imageNodeId = id.replace(/_vid$/, "_img");

  const shot = useSceneStore((s) =>
    s.scenes.flatMap((sc) => sc.shots).find((sh) => sh.node_id === imageNodeId)
  );

  const shotStatus = shot?.status ?? "idle";
  const videoUrl = shot?.video_url ?? data.outputUrl;
  const isProcessing = ["video_pending", "video_processing"].includes(shotStatus);

  return (
    <NodeWrapper id={id} accentColor="#ef4444" icon="movie" title="Video Gen">
      <Handle type="target" position={Position.Left} id="image-in" style={{ top: "40%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-[#0f0f1a]" />
      <Handle type="target" position={Position.Left} id="prompt-in" style={{ top: "65%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-[#0f0f1a]" />

      <div className="flex flex-col gap-2">
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-red-500/10 ring-1 ring-red-500/20">
          {videoUrl ? (
            <video src={videoUrl} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : isProcessing ? (
            <span className="material-symbols-rounded text-[24px] animate-spin text-red-400">progress_activity</span>
          ) : (
            <span className="material-symbols-rounded text-[24px] text-red-400/40">movie</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${
            shotStatus === "completed" ? "bg-green-400"
            : shotStatus === "failed" ? "bg-red-400"
            : isProcessing ? "animate-pulse bg-red-400"
            : "bg-white/20"
          }`} />
          <span className="text-xs text-white/50">{STATUS_LABEL[shotStatus] ?? "Ready"}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="video-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-[#0f0f1a]" />
    </NodeWrapper>
  );
});

VideoGenNode.displayName = "VideoGenNode";
