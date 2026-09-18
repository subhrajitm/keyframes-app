"use client";

import { useState } from "react";
import { ScenePanel } from "./scene-panel";
import { NodePalette } from "./node-palette";
import { AssetLibrary } from "./asset-library";

interface StudioLeftPanelProps {
  projectId: string;
}

type Tab = "scenes" | "assets" | "nodes";

export function StudioLeftPanel({ projectId }: StudioLeftPanelProps) {
  const [tab, setTab] = useState<Tab>("scenes");

  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-white/10 bg-[#0a0a12]">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-white/10">
        <TabButton active={tab === "scenes"} onClick={() => setTab("scenes")} icon="movie" label="Scenes" />
        <TabButton active={tab === "assets"} onClick={() => setTab("assets")} icon="image" label="Assets" />
        <TabButton active={tab === "nodes"} onClick={() => setTab("nodes")} icon="layers" label="Nodes" />
      </div>

      <div className={`flex-1 overflow-hidden ${tab === "scenes" ? "flex flex-col" : "hidden"}`}>
        <ScenePanel projectId={projectId} embedded />
      </div>
      <div className={`flex-1 overflow-hidden ${tab === "assets" ? "flex flex-col" : "hidden"}`}>
        <AssetLibrary />
      </div>
      <div className={`flex-1 overflow-hidden ${tab === "nodes" ? "flex flex-col" : "hidden"}`}>
        <NodePalette />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: string; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 py-3.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        active
          ? "border-b-2 border-violet-500 text-violet-300"
          : "border-b-2 border-transparent text-white/25 hover:text-white/55"
      }`}
    >
      <span className="material-symbols-rounded text-[20px]">{icon}</span>
      {label}
    </button>
  );
}
