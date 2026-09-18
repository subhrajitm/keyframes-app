"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

const VIEW_LABELS = ["F", "S", "¾"];

export const CharacterNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const views = data.characterViews as string[] | undefined;

  return (
    <NodeWrapper id={id} accentColor="#a855f7" icon="person" title="Character">
      <div className="flex flex-col items-center gap-2">
        {views?.length ? (
          // Multi-view sheet grid
          <div className="grid grid-cols-3 gap-1 w-full">
            {views.map((url, i) => (
              <div key={i} className="relative overflow-hidden rounded">
                <img
                  src={url}
                  alt={VIEW_LABELS[i]}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 rounded text-[8px] bg-black/60 px-0.5 text-white/60">
                  {VIEW_LABELS[i]}
                </span>
              </div>
            ))}
          </div>
        ) : data.characterImageUrl ? (
          <img
            src={data.characterImageUrl as string}
            alt={data.characterName ?? "Character"}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-violet-500/40"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 ring-2 ring-violet-500/20">
            <span className="material-symbols-rounded text-[32px] text-violet-400/60">person</span>
          </div>
        )}

        <p className="text-center text-sm font-medium text-white/80">
          {data.characterName || "Unnamed Character"}
        </p>

        {views?.length && (
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] text-violet-300">
            {views.length} views
          </span>
        )}
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
