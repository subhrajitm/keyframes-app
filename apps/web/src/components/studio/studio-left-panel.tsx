"use client";

import { useState } from "react";
import { Layers, Film } from "lucide-react";
import { ScenePanel } from "./scene-panel";
import { NodePalette } from "./node-palette";

interface StudioLeftPanelProps {
  projectId: string;
}

type Tab = "scenes" | "nodes";

export function StudioLeftPanel({ projectId }: StudioLeftPanelProps) {
  const [tab, setTab] = useState<Tab>("scenes");

  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0a12]">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-white/10">
        <TabButton
          active={tab === "scenes"}
          onClick={() => setTab("scenes")}
          icon={<Film className="h-3.5 w-3.5" />}
          label="Scenes"
        />
        <TabButton
          active={tab === "nodes"}
          onClick={() => setTab("nodes")}
          icon={<Layers className="h-3.5 w-3.5" />}
          label="Nodes"
        />
      </div>

      {/* Panel body — render both but hide inactive to preserve state */}
      <div className={`flex-1 overflow-hidden ${tab === "scenes" ? "flex flex-col" : "hidden"}`}>
        <ScenePanel projectId={projectId} embedded />
      </div>
      <div className={`flex-1 overflow-hidden ${tab === "nodes" ? "flex flex-col" : "hidden"}`}>
        <NodePalette />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors ${
        active
          ? "border-b-2 border-violet-500 text-violet-300"
          : "border-b-2 border-transparent text-white/30 hover:text-white/60"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
