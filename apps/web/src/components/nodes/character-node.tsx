"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

const VIEW_LABELS = ["F", "S", "¾"];

export const CharacterNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const views = data.characterViews as string[] | undefined;
  const imageUrl = data.characterImageUrl as string | undefined;

  return (
    <NodeWrapper
      id={id}
      title="Character"
      icon="person"
      avatarColor="#f59e0b"
      avatarIcon="person"
      imageSlot={
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-white/[0.025]">
          {views?.length ? (
            <div className="grid w-full grid-cols-3 gap-px">
              {views.map((url, i) => (
                <div key={i} className="relative overflow-hidden">
                  <img
                    src={url}
                    alt={VIEW_LABELS[i]}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-0.5 text-[8px] text-white/50">
                    {VIEW_LABELS[i]}
                  </span>
                </div>
              ))}
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={data.characterName ?? "Character"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="material-symbols-rounded text-[40px] text-white/[0.07]">person</span>
          )}
        </div>
      }
    >
      <p className="text-[12px] text-white/45">
        {(data.characterName as string) || "Unnamed character"}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        id="character-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]"
      />
    </NodeWrapper>
  );
});

CharacterNode.displayName = "CharacterNode";
