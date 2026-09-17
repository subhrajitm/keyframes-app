"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Check, Play, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";

interface StudioToolbarProps {
  projectId: string;
  initialTitle: string;
  onTitleChange: (title: string) => Promise<void>;
}

export function StudioToolbar({ projectId, initialTitle, onTitleChange }: StudioToolbarProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { isDirty, isSaving } = useProjectStore();

  const handleTitleBlur = async () => {
    if (title !== initialTitle && title.trim()) {
      setIsTitleSaving(true);
      await onTitleChange(title.trim());
      setIsTitleSaving(false);
    }
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setActionError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompose = async () => {
    setIsComposing(true);
    setActionError(null);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Composition failed");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Composition failed");
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a12] px-4">
      {/* Left: back + title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
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
            if (e.key === "Escape") {
              setTitle(initialTitle);
              titleRef.current?.blur();
            }
          }}
          className="bg-transparent text-sm font-medium text-white/80 outline-none focus:text-white"
          style={{ width: `${Math.max(title.length, 8)}ch` }}
        />

        {isTitleSaving && <Loader2 className="h-3 w-3 animate-spin text-white/30" />}
      </div>

      {/* Right: save status + actions */}
      <div className="flex items-center gap-3">
        {actionError && (
          <span className="text-[10px] text-red-400/80">{actionError}</span>
        )}

        {isSaving ? (
          <span className="flex items-center gap-1.5 text-xs text-white/30">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        ) : isDirty ? (
          <span className="text-xs text-white/30">Unsaved changes</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-white/20">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-3 text-xs text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 disabled:opacity-40"
          onClick={handleGenerateAll}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {isGenerating ? "Generating…" : "Generate All"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-3 text-xs text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 disabled:opacity-40"
          onClick={handleCompose}
          disabled={isComposing}
        >
          {isComposing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Film className="h-3 w-3" />
          )}
          {isComposing ? "Composing…" : "Compose"}
        </Button>
      </div>
    </header>
  );
}
