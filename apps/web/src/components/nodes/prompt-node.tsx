"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import { useProjectStore } from "@/store/project-store";
import type { KFNode } from "@/store/project-store";

export const PromptNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const updateNodeData = useProjectStore((s) => s.updateNodeData);

  return (
    <NodeWrapper id={id} accentColor="#3b82f6" icon="✏️" title="Prompt">
      <textarea
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/30 focus:border-blue-500/60 focus:outline-none"
        rows={4}
        placeholder="Describe the shot…"
        value={data.promptText ?? ""}
        onChange={(e) => updateNodeData(id, { promptText: e.target.value })}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-[#0f0f1a]"
      />
    </NodeWrapper>
  );
});

PromptNode.displayName = "PromptNode";
