"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const OutputNode = memo(({ id, data }: NodeProps<KFNode>) => {
  return (
    <NodeWrapper
      id={id}
      title="Output"
      icon="videocam"
      avatarColor="#6366f1"
      avatarIcon="play_arrow"
      imageSlot={
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-white/[0.025]">
          {data.outputUrl ? (
            <video
              src={data.outputUrl as string}
              className="h-full w-full object-cover"
              muted
              loop
            />
          ) : (
            <span className="material-symbols-rounded text-[40px] text-white/[0.07]">videocam</span>
          )}
        </div>
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        id="video-in"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]"
      />

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-white/35">
          Clip {(data.clipOrder ?? 0) + 1}
        </span>
      </div>
    </NodeWrapper>
  );
});

OutputNode.displayName = "OutputNode";
