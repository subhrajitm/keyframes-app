"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { User } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const CharacterNode = memo(({ id, data }: NodeProps<KFNode>) => {
  return (
    <NodeWrapper id={id} accentColor="#a855f7" icon="🎭" title="Character">
      <div className="flex flex-col items-center gap-2">
        {data.characterImageUrl ? (
          <img
            src={data.characterImageUrl}
            alt={data.characterName ?? "Character"}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-violet-500/40"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 ring-2 ring-violet-500/20">
            <User className="h-8 w-8 text-violet-400/60" />
          </div>
        )}
        <p className="text-center text-sm font-medium text-white/80">
          {data.characterName || "Unnamed Character"}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="character-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-violet-500 !bg-[#0f0f1a]"
      />
    </NodeWrapper>
  );
});

CharacterNode.displayName = "CharacterNode";
