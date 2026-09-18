"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useSceneStore } from "@/store/scene-store";
import type { DirectorInput } from "@keyframe/types";

interface DirectorBarProps {
  projectId: string;
  initialDescription?: string;
}

export function DirectorBar({ projectId, initialDescription }: DirectorBarProps) {
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isRunning, setIsRunning] = useState(false);

  const loadGraph = useProjectStore((s) => s.loadGraph);
  const settings = useProjectStore((s) => s.settings);
  const loadScenes = useSceneStore((s) => s.loadScenes);

  const handleRun = async () => {
    if (!description.trim() || isRunning) return;
    setIsRunning(true);

    const input: DirectorInput = {
      projectId,
      description: description.trim(),
      style: settings.style || undefined,
      totalDuration: settings.totalDuration,
      numScenes: settings.numScenes,
      imageModel: settings.imageModel,
      videoModel: settings.videoModel,
    };

    const tid = toast.loading("Director is planning your shots…");
    try {
      const res = await fetch("/api/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Director failed");

      loadGraph(data.graph.nodes, data.graph.edges);
      await loadScenes(projectId);
      setDescription("");
      const sceneCount = data.scenes?.length ?? 0;
      const shotCount = data.scenes?.reduce((s: number, sc: { shots: unknown[] }) => s + sc.shots.length, 0) ?? 0;
      toast.success(`Shot plan ready — ${sceneCount} scenes, ${shotCount} shots`, { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Director failed", { id: tid });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-[#080810] px-4 py-2.5">
      <span className="material-symbols-rounded text-[18px] shrink-0 text-violet-400/70">auto_awesome</span>

      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/30 focus:outline-none"
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

      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 h-8 gap-1.5 px-3 text-sm text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 disabled:opacity-40"
        onClick={handleRun}
        disabled={!description.trim() || isRunning}
      >
        {isRunning ? (
          <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-rounded text-[16px]">auto_awesome</span>
        )}
        {isRunning ? "Directing…" : "Direct"}
      </Button>
    </div>
  );
}
