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

type InputMode = "describe" | "script";

export function DirectorBar({ projectId, initialDescription }: DirectorBarProps) {
  const [mode, setMode] = useState<InputMode>("describe");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isRunning, setIsRunning] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const revealGraph = useProjectStore((s) => s.revealGraph);
  const settings = useProjectStore((s) => s.settings);
  const loadScenes = useSceneStore((s) => s.loadScenes);

  const handleEnhance = async () => {
    if (!description.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description.trim(), mode: mode === "script" ? "director" : "director" }),
      });
      const data = await res.json() as { enhanced?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Enhance failed");
      setDescription(data.enhanced ?? description);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enhance failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRun = async () => {
    if (!description.trim() || isRunning) return;
    setIsRunning(true);

    const input: DirectorInput = {
      projectId,
      description: mode === "script"
        ? `[SCREENPLAY]\n${description.trim()}\n[/SCREENPLAY]\nBreak this screenplay into cinematic shots.`
        : description.trim(),
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

      revealGraph(data.graph.nodes, data.graph.edges);
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

  const placeholder = mode === "script"
    ? "Paste your screenplay here…\n\nINT. COFFEE SHOP - DAY\nMaya sits alone, staring at her phone…"
    : 'Describe your video… e.g. "A 30-second coffee brand promo, warm cinematic tones, 3 scenes"';

  return (
    <div className="border-b border-white/10 bg-[#0d0d0d]">
      {/* Mode tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.05] px-4">
        {(["describe", "script"] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
              mode === m
                ? "border-b border-white/50 text-white/80"
                : "text-white/30 hover:text-white/55"
            }`}
          >
            <span className="material-symbols-rounded text-[13px]">
              {m === "describe" ? "auto_awesome" : "article"}
            </span>
            {m === "describe" ? "Describe" : "Script"}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-start gap-3 px-4 py-2.5">
        <span className="material-symbols-rounded mt-0.5 shrink-0 text-[18px] text-white/25">
          {mode === "script" ? "article" : "auto_awesome"}
        </span>

        {mode === "script" ? (
          <textarea
            className="nodrag min-w-0 flex-1 resize-none bg-transparent text-sm text-white/70 placeholder:text-white/25 focus:outline-none leading-relaxed"
            rows={4}
            placeholder={placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
          />
        ) : (
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/30 focus:outline-none"
            placeholder={placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleRun(); }
            }}
            disabled={isRunning}
          />
        )}

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Enhance */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 px-3 text-sm text-white/35 hover:bg-white/[0.05] hover:text-amber-300 disabled:opacity-30"
            onClick={handleEnhance}
            disabled={!description.trim() || isEnhancing || isRunning}
            title="Enhance with AI"
          >
            {isEnhancing
              ? <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
              : <span className="material-symbols-rounded text-[16px]">auto_fix_high</span>
            }
            {isEnhancing ? "Enhancing…" : "Enhance"}
          </Button>

          {/* Direct */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 px-3 text-sm text-white/50 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
            onClick={handleRun}
            disabled={!description.trim() || isRunning}
          >
            {isRunning
              ? <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
              : <span className="material-symbols-rounded text-[16px]">auto_awesome</span>
            }
            {isRunning ? "Directing…" : "Direct"}
          </Button>
        </div>
      </div>
    </div>
  );
}
