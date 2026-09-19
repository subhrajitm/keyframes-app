"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useCredits } from "@/hooks/use-credits";

interface StudioToolbarProps {
  projectId: string;
  initialTitle: string;
  onTitleChange: (title: string) => Promise<void>;
  onSettingsOpen: () => void;
  onSaveTemplate: () => void;
}

export function StudioToolbar({ projectId, initialTitle, onTitleChange, onSettingsOpen, onSaveTemplate }: StudioToolbarProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const { isDirty, isSaving } = useProjectStore();
  const credits = useCredits();

  const handleTitleBlur = async () => {
    if (title !== initialTitle && title.trim()) {
      setIsTitleSaving(true);
      await onTitleChange(title.trim());
      setIsTitleSaving(false);
    }
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    const tid = toast.loading("Queuing generation jobs…");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      toast.success(`${data.runs?.length ?? 0} shots queued — watch the Scene panel for progress`, { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed", { id: tid });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#111111] px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <span className="material-symbols-rounded text-[18px]">chevron_left</span>
          Dashboard
        </Link>
        <span className="text-white/20">/</span>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") titleRef.current?.blur();
            if (e.key === "Escape") { setTitle(initialTitle); titleRef.current?.blur(); }
          }}
          className="bg-transparent text-base font-medium text-white/80 outline-none focus:text-white"
          style={{ width: `${Math.max(title.length, 8)}ch` }}
        />
        {isTitleSaving && <span className="material-symbols-rounded text-[16px] animate-spin text-white/30">progress_activity</span>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {isSaving ? (
          <span className="flex items-center gap-1.5 text-sm text-white/30">
            <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span> Saving…
          </span>
        ) : isDirty ? (
          <span className="text-sm text-white/30">Unsaved</span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-white/30">
            <span className="material-symbols-rounded text-[16px]">check</span> Saved
          </span>
        )}

        {credits !== null && (
          <span className="flex items-center gap-1.5 rounded border border-white/[0.08] px-3 py-1 text-sm text-white/45">
            <span className="material-symbols-rounded text-[15px] text-white/25">bolt</span>
            {credits}
          </span>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-white/40 hover:bg-white/5 hover:text-white/70"
          onClick={onSettingsOpen}
          title="Project settings"
        >
          <span className="material-symbols-rounded text-[18px]">settings</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-3 text-sm text-white/40 hover:bg-white/5 hover:text-white/60"
          onClick={onSaveTemplate}
          title="Save as template"
        >
          <span className="material-symbols-rounded text-[18px]">library_books</span>
          Save template
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-3 text-sm text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 disabled:opacity-40"
          onClick={handleGenerateAll}
          disabled={isGenerating}
        >
          {isGenerating ? <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-rounded text-[16px]">play_arrow</span>}
          {isGenerating ? "Generating…" : "Generate All"}
        </Button>
      </div>
    </header>
  );
}
