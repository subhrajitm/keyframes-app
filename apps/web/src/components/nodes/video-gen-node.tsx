"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Video, Loader2 } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const VideoGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const status = data.generationStatus ?? "idle";
  const isProcessing = status === "processing" || status === "pending";

  return (
    <NodeWrapper id={id} accentColor="#ef4444" icon="🎬" title="Video Gen">
      <Handle
        type="target"
        position={Position.Left}
        id="image-in"
        style={{ top: "40%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-[#0f0f1a]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="prompt-in"
        style={{ top: "65%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-[#0f0f1a]"
      />

      <div className="flex flex-col gap-2">
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-red-500/10 ring-1 ring-red-500/20">
          {data.outputUrl ? (
            <video src={data.outputUrl} className="h-full w-full object-cover" muted loop />
          ) : isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-red-400" />
          ) : (
            <Video className="h-6 w-6 text-red-400/40" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "completed"
                ? "bg-green-400"
                : status === "failed"
                ? "bg-red-400"
                : isProcessing
                ? "animate-pulse bg-red-400"
                : "bg-white/20"
            }`}
          />
          <span className="text-xs text-white/50">
            {status === "idle" ? "Ready" : status === "processing" || status === "pending" ? "Generating…" : status === "completed" ? "Done" : "Failed"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="video-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-[#0f0f1a]"
      />
    </NodeWrapper>
  );
});

VideoGenNode.displayName = "VideoGenNode";
