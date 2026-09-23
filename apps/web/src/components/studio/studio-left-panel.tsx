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
    <div className="flex w-72 flex-1 flex-col border-r border-white/10 bg-[#0d0d0d]">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-white/[0.06]">
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
      className={`relative flex flex-1 flex-col items-center gap-1 py-3.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        active ? "text-white" : "text-white/25 hover:text-white/55"
      }`}
    >
      <span className="material-symbols-rounded text-[20px]">{icon}</span>
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-violet-500" />
      )}
    </button>
  );
}
