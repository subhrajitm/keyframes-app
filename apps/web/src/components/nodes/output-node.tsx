"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const OutputNode = memo(({ id, data }: NodeProps<KFNode>) => {
  return (
    <NodeWrapper id={id} accentColor="#eab308" icon="videocam" title="Output">
      <Handle
        type="target"
        position={Position.Left}
        id="video-in"
        className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-[#0f0f1a]"
      />

      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-yellow-500/10 ring-1 ring-yellow-500/20">
          {data.outputUrl ? (
            <video src={data.outputUrl} className="h-full w-full object-cover" muted loop />
          ) : (
            <span className="material-symbols-rounded text-[24px] text-yellow-400/40">videocam</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2 py-0.5">
          <span className="text-xs text-yellow-400">
            Clip #{(data.clipOrder ?? 0) + 1}
          </span>
        </div>
      </div>
    </NodeWrapper>
  );
});

OutputNode.displayName = "OutputNode";
