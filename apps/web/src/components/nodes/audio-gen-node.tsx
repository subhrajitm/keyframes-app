"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const AudioGenNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const audioType = (data.audioType as string) ?? "narration";
  const audioUrl  = data.audioUrl as string | undefined;

  return (
    <NodeWrapper
      id={id}
      title="Audio Gen"
      icon="mic"
      avatarColor="#8b5cf6"
      avatarIcon="music_note"
    >
      {/* Type badge */}
      <div className="mb-2 flex items-center gap-1.5">
        <span className="material-symbols-rounded text-[13px] text-rose-400">
          {audioType === "narration" ? "record_voice_over" : "surround_sound"}
        </span>
        <span className="text-[11px] capitalize text-white/40">{audioType}</span>
      </div>

      {/* Audio player or placeholder */}
      {audioUrl ? (
        <audio controls src={audioUrl} className="nodrag w-full h-8" />
      ) : (
        <div className="flex h-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <span className="material-symbols-rounded text-[20px] text-white/[0.08]">mic</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="audio-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]"
      />
    </NodeWrapper>
  );
});

AudioGenNode.displayName = "AudioGenNode";
