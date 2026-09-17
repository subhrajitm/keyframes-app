"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useSceneStore } from "@/store/scene-store";
import type { DirectorInput } from "@keyframe/types";

interface DirectorBarProps {
  projectId: string;
}

export function DirectorBar({ projectId }: DirectorBarProps) {
  const [description, setDescription] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = useProjectStore((s) => s.loadGraph);
  const settings = useProjectStore((s) => s.settings);
  const loadScenes = useSceneStore((s) => s.loadScenes);

  const handleRun = async () => {
    if (!description.trim() || isRunning) return;
    setIsRunning(true);
    setError(null);

    const input: DirectorInput = {
      projectId,
      description: description.trim(),
      style: settings.style || undefined,
      totalDuration: settings.totalDuration,
      numScenes: settings.numScenes,
    };

    try {
      const res = await fetch("/api/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Director failed");

      // Update the graph in-store so React Flow reflects the new nodes
      loadGraph(data.graph.nodes, data.graph.edges);
      // Reload scenes panel
      await loadScenes(projectId);
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-[#080810] px-3 py-2">
      <Wand2 className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />

      <input
        className="min-w-0 flex-1 bg-transparent text-xs text-white/70 placeholder:text-white/20 focus:outline-none"
        placeholder={'Describe your video… e.g. "A 30-second coffee brand promo, warm cinematic tones, 3 scenes"'}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleRun();
          }
        }}
        disabled={isRunning}
      />

      {error && (
        <span className="shrink-0 text-[10px] text-red-400/80">{error}</span>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 h-7 gap-1.5 px-3 text-xs text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 disabled:opacity-40"
        onClick={handleRun}
        disabled={!description.trim() || isRunning}
      >
        {isRunning ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Wand2 className="h-3 w-3" />
        )}
        {isRunning ? "Directing…" : "Direct"}
      </Button>
    </div>
  );
}
