"use client";

import { type DragEvent } from "react";
import type { NodeType } from "@/store/project-store";

const NODE_TYPES: { type: NodeType; icon: string; label: string; description: string; color: string }[] = [
  { type: "character", icon: "person",     label: "Character", description: "Reference a character", color: "#a855f7" },
  { type: "location",  icon: "location_on",label: "Location",  description: "Set the scene",         color: "#22c55e" },
  { type: "prompt",    icon: "edit",        label: "Prompt",    description: "Describe a shot",       color: "#3b82f6" },
  { type: "imageGen",  icon: "image",       label: "Image Gen", description: "Generate an image",     color: "#f97316" },
  { type: "videoGen",  icon: "movie",       label: "Video Gen", description: "Animate a frame",       color: "#ef4444" },
  { type: "output",    icon: "videocam",    label: "Output",    description: "Collect a final clip",  color: "#eab308" },
  { type: "audioGen",  icon: "mic",         label: "Audio Gen", description: "Generate narration/SFX", color: "#8b5cf6" },
];

export function NodePalette() {
  const onDragStart = (e: DragEvent, type: NodeType) => {
    e.dataTransfer.setData("application/keyframe-node", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-white/10 bg-[#111111]">
      <div className="border-b border-white/10 px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Drag to canvas</p>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {NODE_TYPES.map((n) => (
          <div
            key={n.type}
            draggable
            onDragStart={(e) => onDragStart(e, n.type)}
            className="flex cursor-grab items-center gap-3 rounded-md border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.06] active:cursor-grabbing"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${n.color}18` }}
            >
              <span className="material-symbols-rounded text-[18px]" style={{ color: n.color }}>{n.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/75">{n.label}</p>
              <p className="truncate text-[10px] text-white/30">{n.description}</p>
            </div>
            <span className="material-symbols-rounded ml-auto shrink-0 text-[14px] text-white/15">drag_indicator</span>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-white/[0.06] px-4 py-3">
        <p className="text-[10px] text-white/20">Drag a node onto the canvas to add it</p>
      </div>
    </aside>
  );
}
