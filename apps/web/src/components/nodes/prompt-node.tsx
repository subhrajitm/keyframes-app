"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import { useProjectStore } from "@/store/project-store";
import type { KFNode } from "@/store/project-store";

const MAX_CHARS = 300;

export const PromptNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const updateNodeData = useProjectStore((s) => s.updateNodeData);
  const prompt = data.promptText ?? "";

  return (
    <NodeWrapper
      id={id}
      title="Base Prompt"
      icon="edit_note"
      avatarColor="#3b82f6"
      avatarIcon="edit"
      wide
      charCount={prompt.length}
      maxChars={MAX_CHARS}
    >
      <textarea
        className="nodrag w-full resize-none rounded-md border-0 bg-transparent p-0 text-[12px] leading-[1.65] text-white/55 placeholder:text-white/20 focus:outline-none focus:ring-0"
        style={{ textAlign: "justify" }}
        rows={6}
        placeholder="Describe the shot in cinematic detail…"
        value={prompt}
        maxLength={MAX_CHARS}
        onChange={(e) => updateNodeData(id, { promptText: e.target.value })}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]"
      />
    </NodeWrapper>
  );
});

PromptNode.displayName = "PromptNode";
