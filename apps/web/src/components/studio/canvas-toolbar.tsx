"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useProjectStore, type NodeType } from "@/store/project-store";
import { cn } from "@/lib/utils";

const NODE_CATEGORIES: {
  label: string;
  nodes: { type: NodeType; icon: string; label: string; description: string; color: string }[];
}[] = [
  {
    label: "Core",
    nodes: [
      { type: "prompt",    icon: "edit_note",    label: "Prompt",    description: "Describe a shot in detail",      color: "#3b82f6" },
      { type: "character", icon: "person",        label: "Character", description: "Reference a character",          color: "#f59e0b" },
      { type: "location",  icon: "landscape",     label: "Location",  description: "Set the scene environment",      color: "#10b981" },
    ],
  },
  {
    label: "Generate",
    nodes: [
      { type: "imageGen",  icon: "image",         label: "Image Gen", description: "Generate a still frame",        color: "#7c3aed" },
      { type: "videoGen",  icon: "movie",         label: "Video Gen", description: "Animate a frame into a clip",   color: "#ef4444" },
      { type: "output",    icon: "play_arrow",    label: "Output",    description: "Collect a clip for the film",   color: "#6366f1" },
    ],
  },
];

interface CanvasToolbarProps {
  timelineOpen: boolean;
  onToggleTimeline: () => void;
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export function CanvasToolbar({
  timelineOpen,
  onToggleTimeline,
  panelOpen,
  onTogglePanel,
}: CanvasToolbarProps) {
  const [addOpen, setAddOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useProjectStore((s) => s.addNode);

  // Close popup when clicking outside
  useEffect(() => {
    if (!addOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addOpen]);

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const canvas = document.querySelector(".react-flow");
      const rect = canvas?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const pos = screenToFlowPosition({ x: cx, y: cy });
      addNode(type, { x: pos.x - 130, y: pos.y - 100 });
      setAddOpen(false);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    // Full-canvas overlay — passes pointer events through except for toolbar/popup
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end pb-5">
      <div ref={containerRef} className="pointer-events-auto flex flex-col items-center gap-2">

        {/* ── Add popup ── */}
        {addOpen && (
          <div className="w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1018] shadow-2xl">
            <div className="border-b border-white/[0.06] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Add to canvas</p>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-2">
              {NODE_CATEGORIES.map((cat) => (
                <div key={cat.label} className="mb-1">
                  <p className="px-2 pb-1.5 pt-2.5 text-[9px] font-bold uppercase tracking-widest text-white/20">
                    {cat.label}
                  </p>
                  {cat.nodes.map((n) => (
                    <button
                      key={n.type}
                      onClick={() => handleAddNode(n.type)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${n.color}18` }}
                      >
                        <span
                          className="material-symbols-rounded text-[20px]"
                          style={{ color: n.color }}
                        >
                          {n.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white/80">{n.label}</p>
                        <p className="text-[11px] text-white/30">{n.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Toolbar pill ── */}
        <div className="flex items-center gap-0.5 rounded-2xl border border-white/[0.08] bg-[#0d1018]/90 p-1.5 shadow-2xl backdrop-blur-xl">

          {/* Panel toggle */}
          <ToolBtn
            icon="dock_to_left"
            active={panelOpen}
            onClick={onTogglePanel}
            title={panelOpen ? "Hide panel" : "Show panel"}
          />

          <Sep />

          {/* Timeline toggle */}
          <ToolBtn
            icon="view_timeline"
            active={timelineOpen}
            onClick={onToggleTimeline}
            title={timelineOpen ? "Hide timeline" : "Show timeline"}
          />

          <Sep />

          {/* Undo / Redo (visual — history not yet wired) */}
          <ToolBtn icon="undo" onClick={() => {}} title="Undo" />
          <ToolBtn icon="redo" onClick={() => {}} title="Redo" />

          <Sep />

          {/* + Add */}
          <button
            onClick={() => setAddOpen((o) => !o)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-all",
              addOpen
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "bg-white/[0.07] text-white/65 hover:bg-white/[0.11] hover:text-white",
            )}
          >
            <span className="material-symbols-rounded text-[16px]">add</span>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({
  icon,
  active,
  onClick,
  title,
}: {
  icon: string;
  active?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
        active
          ? "bg-violet-600/20 text-violet-300"
          : "text-white/35 hover:bg-white/[0.06] hover:text-white/70",
      )}
    >
      <span className="material-symbols-rounded text-[20px]">{icon}</span>
    </button>
  );
}

function Sep() {
  return <div className="mx-0.5 h-5 w-px bg-white/[0.08]" />;
}
