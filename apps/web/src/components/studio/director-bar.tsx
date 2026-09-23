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
  onClose?: () => void;
}

type InputMode = "describe" | "script";

export function DirectorBar({ projectId, initialDescription, onClose }: DirectorBarProps) {
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
        body: JSON.stringify({ prompt: description.trim(), mode: "director" }),
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
    <aside className="flex w-72 flex-1 flex-col border-r border-white/10 bg-[#0d0d0d]">

      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[16px] text-rose-400">auto_awesome</span>
          <span className="text-xs font-semibold text-white/70">Director</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/25 transition-colors hover:text-white/60"
          >
            <span className="material-symbols-rounded text-[16px]">chevron_left</span>
          </button>
        )}
      </div>

      {/* Mode pill toggle */}
      <div className="border-b border-white/[0.05] px-3 py-2.5">
        <div className="flex rounded-lg bg-white/[0.04] p-0.5">
          {(["describe", "script"] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-rose-500/20 to-violet-500/10 text-white shadow-sm"
                  : "text-white/35 hover:text-white/65"
              }`}
            >
              <span className="material-symbols-rounded text-[13px]">
                {m === "describe" ? "auto_awesome" : "article"}
              </span>
              {m === "describe" ? "Describe" : "Script"}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
        {mode === "script" ? (
          <textarea
            className="nodrag flex-1 resize-none bg-transparent text-sm text-white/70 placeholder:text-white/25 focus:outline-none leading-relaxed"
            placeholder={placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
          />
        ) : (
          <textarea
            className="nodrag flex-1 resize-none bg-transparent text-sm text-white/70 placeholder:text-white/25 focus:outline-none leading-relaxed"
            placeholder={placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleRun(); }
            }}
            disabled={isRunning}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-white/[0.06] p-3">
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start gap-2 text-xs text-white/35 hover:bg-white/[0.05] hover:text-amber-300 disabled:opacity-30"
          onClick={handleEnhance}
          disabled={!description.trim() || isEnhancing || isRunning}
        >
          {isEnhancing
            ? <span className="material-symbols-rounded text-[15px] animate-spin">progress_activity</span>
            : <span className="material-symbols-rounded text-[15px]">auto_fix_high</span>
          }
          {isEnhancing ? "Enhancing…" : "Enhance with AI"}
        </Button>

        <Button
          size="sm"
          variant="rose"
          className="w-full gap-2 text-xs disabled:opacity-40"
          onClick={handleRun}
          disabled={!description.trim() || isRunning}
        >
          {isRunning
            ? <span className="material-symbols-rounded text-[15px] animate-spin">progress_activity</span>
            : <span className="material-symbols-rounded text-[15px]">auto_awesome</span>
          }
          {isRunning ? "Directing…" : "Direct"}
        </Button>
      </div>
    </aside>
  );
}
