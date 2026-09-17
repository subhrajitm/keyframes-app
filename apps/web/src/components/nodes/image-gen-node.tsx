"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ImageIcon, Loader2 } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

const STATUS_LABEL: Record<string, string> = {
  idle: "Ready",
  pending: "Queued",
  processing: "Generating…",
  completed: "Done",
  failed: "Failed",
};

export const ImageGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const status = data.generationStatus ?? "idle";
  const isProcessing = status === "processing" || status === "pending";

  return (
    <NodeWrapper id={id} accentColor="#f97316" icon="🖼" title="Image Gen">
      {/* Inputs */}
      <Handle
        type="target"
        position={Position.Left}
        id="character-in"
        style={{ top: "35%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-violet-500 !bg-[#0f0f1a]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="location-in"
        style={{ top: "55%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-[#0f0f1a]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="prompt-in"
        style={{ top: "75%" }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-[#0f0f1a]"
      />

      <div className="flex flex-col gap-2">
        {/* Preview area */}
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20">
          {data.outputUrl ? (
            <img src={data.outputUrl} alt="Generated" className="h-full w-full object-cover" />
          ) : isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          ) : (
            <ImageIcon className="h-6 w-6 text-orange-400/40" />
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "completed"
                ? "bg-green-400"
                : status === "failed"
                ? "bg-red-400"
                : isProcessing
                ? "animate-pulse bg-orange-400"
                : "bg-white/20"
            }`}
          />
          <span className="text-xs text-white/50">{STATUS_LABEL[status]}</span>
        </div>
      </div>

      {/* Output */}
      <Handle
        type="source"
        position={Position.Right}
        id="image-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-[#0f0f1a]"
      />
    </NodeWrapper>
  );
});

ImageGenNode.displayName = "ImageGenNode";
