"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Save, ChevronLeft, Loader2, Check } from "lucide-react";
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
  const titleRef = useRef<HTMLInputElement>(null);
  const { isDirty, isSaving } = useProjectStore();

  const handleTitleBlur = async () => {
    if (title !== initialTitle && title.trim()) {
      setIsTitleSaving(true);
      await onTitleChange(title.trim());
      setIsTitleSaving(false);
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

      {/* Right: save status */}
      <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
