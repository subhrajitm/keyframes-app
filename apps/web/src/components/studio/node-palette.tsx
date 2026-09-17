"use client";

import { type DragEvent } from "react";
import type { NodeType } from "@/store/project-store";

const NODE_TYPES: { type: NodeType; icon: string; label: string; description: string; color: string }[] = [
  { type: "character", icon: "🎭", label: "Character", description: "Reference a character", color: "#a855f7" },
  { type: "location", icon: "🗺", label: "Location", description: "Set the scene", color: "#22c55e" },
  { type: "prompt", icon: "✏️", label: "Prompt", description: "Describe a shot", color: "#3b82f6" },
  { type: "imageGen", icon: "🖼", label: "Image Gen", description: "Generate an image", color: "#f97316" },
  { type: "videoGen", icon: "🎬", label: "Video Gen", description: "Animate a frame", color: "#ef4444" },
  { type: "output", icon: "🎥", label: "Output", description: "Collect a final clip", color: "#eab308" },
];

export function NodePalette() {
  const onDragStart = (e: DragEvent, type: NodeType) => {
    e.dataTransfer.setData("application/keyframe-node", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0a12]">
      <div className="border-b border-white/10 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Nodes</p>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto p-2">
        {NODE_TYPES.map((n) => (
          <div
            key={n.type}
            draggable
            onDragStart={(e) => onDragStart(e, n.type)}
            className="flex cursor-grab items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 transition-colors hover:border-white/10 hover:bg-white/10 active:cursor-grabbing"
          >
            <span className="text-lg">{n.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80">{n.label}</p>
              <p className="truncate text-[10px] text-white/30">{n.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-white/10 p-3">
        <p className="text-[10px] text-white/20">Drag a node onto the canvas to add it</p>
      </div>
    </aside>
  );
}
