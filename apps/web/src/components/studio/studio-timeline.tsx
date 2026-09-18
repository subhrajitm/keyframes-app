"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useSceneStore } from "@/store/scene-store";
import { useProjectStore } from "@/store/project-store";
import type { Shot } from "@keyframe/types";

interface StudioTimelineProps {
  projectId: string;
}

const STATUS_DOT: Record<Shot["status"], string> = {
  idle:             "bg-white/20",
  image_pending:    "bg-yellow-400 animate-pulse",
  image_processing: "bg-orange-400 animate-pulse",
  video_pending:    "bg-yellow-400 animate-pulse",
  video_processing: "bg-blue-400 animate-pulse",
  completed:        "bg-green-400",
  failed:           "bg-red-400",
};

export function StudioTimeline({ projectId }: StudioTimelineProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const draggedId = useRef<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const scenes = useSceneStore((s) => s.scenes);
  const { settings, updateSettings } = useProjectStore();

  // All shots in default scene/shot order
  const defaultOrder: Shot[] = scenes.flatMap((sc) =>
    [...sc.shots].sort((a, b) => a.order_index - b.order_index)
  );

  // Apply custom clip order if set
  const orderedShots: Shot[] = settings.clipOrder?.length
    ? settings.clipOrder
        .map((id) => defaultOrder.find((s) => s.id === id))
        .filter((s): s is Shot => !!s)
        .concat(defaultOrder.filter((s) => !settings.clipOrder!.includes(s.id)))
    : defaultOrder;

  // Drag-to-reorder
  const onDragStart = useCallback((id: string) => { draggedId.current = id; }, []);

  const onDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setHoverIndex(index);
  }, []);

  const onDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromId = draggedId.current;
    if (!fromId) return;

    const fromIndex = orderedShots.findIndex((s) => s.id === fromId);
    if (fromIndex === dropIndex) { setHoverIndex(null); return; }

    const reordered = [...orderedShots];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    updateSettings({ clipOrder: reordered.map((s) => s.id) });
    draggedId.current = null;
    setHoverIndex(null);
    toast.success("Clip order updated");
  }, [orderedShots, updateSettings]);

  const onDragEnd = useCallback(() => {
    draggedId.current = null;
    setHoverIndex(null);
  }, []);

  // Music upload
  const handleMusicUpload = useCallback(async (file: File) => {
    setIsUploadingMusic(true);
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);
    form.append("type", "audio");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      updateSettings({ musicUrl: data.url });
      toast.success("Music track added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingMusic(false);
    }
  }, [projectId, updateSettings]);

  // Compose
  const handleCompose = useCallback(async () => {
    setIsComposing(true);
    const tid = toast.loading("Composing final video…");
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Compose failed");
      toast.success("Composition job started — check dashboard when done", { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Compose failed", { id: tid });
    } finally {
      setIsComposing(false);
    }
  }, [projectId]);

  const completedCount = orderedShots.filter((s) => s.status === "completed").length;
  const totalCount = orderedShots.length;

  return (
    <div className={`shrink-0 border-t border-white/10 bg-[#0d0d0d] transition-all ${collapsed ? "h-8" : "h-44"}`}>
      {/* Header bar */}
      <div className="flex h-8 items-center justify-between border-b border-white/5 px-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setCollapsed((c) => !c)} className="text-white/30 hover:text-white/60">
            {collapsed ? <span className="material-symbols-rounded text-[14px]">expand_less</span> : <span className="material-symbols-rounded text-[14px]">expand_more</span>}
          </button>
          <span className="text-xs font-medium text-white/50">Timeline</span>
          {totalCount > 0 && (
            <span className="text-xs text-white/40">{completedCount}/{totalCount} ready</span>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2">
            {/* Music */}
            {settings.musicUrl ? (
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                <span className="material-symbols-rounded text-[16px] text-purple-400">music_note</span>
                <span className="max-w-[100px] truncate text-xs text-white/50">Music added</span>
                <button
                  onClick={() => updateSettings({ musicUrl: undefined })}
                  className="text-white/20 hover:text-white/50"
                >
                  <span className="material-symbols-rounded text-[16px]">close</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => musicInputRef.current?.click()}
                disabled={isUploadingMusic}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-white/40 hover:border-purple-500/30 hover:text-purple-300"
              >
                {isUploadingMusic ? <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-rounded text-[16px]">music_note</span>}
                Add music
              </button>
            )}

            <button
              onClick={handleCompose}
              disabled={isComposing || completedCount === 0}
              className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 hover:bg-blue-500/20 disabled:opacity-40"
            >
              {isComposing ? <span className="material-symbols-rounded text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-rounded text-[16px]">play_arrow</span>}
              {isComposing ? "Composing…" : "Compose Film"}
            </button>
          </div>
        )}
      </div>

      {/* Hidden music input */}
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/aac"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMusicUpload(f); }}
      />

      {/* Clips strip */}
      {!collapsed && (
        <div className="flex h-[calc(100%-2rem)] items-start gap-2 overflow-x-auto overflow-y-hidden px-3 py-2">
          {orderedShots.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <p className="text-xs text-white/30">
                Run the Director to create a shot plan, then Generate All to produce clips
              </p>
            </div>
          ) : (
            orderedShots.map((shot, index) => (
              <ClipCard
                key={shot.id}
                shot={shot}
                index={index}
                isHovered={hoverIndex === index}
                onDragStart={() => onDragStart(shot.id)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDrop(e, index)}
                onDragEnd={onDragEnd}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ClipCardProps {
  shot: Shot;
  index: number;
  isHovered: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function ClipCard({ shot, index, isHovered, onDragStart, onDragOver, onDrop, onDragEnd }: ClipCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group relative flex shrink-0 cursor-grab flex-col overflow-hidden rounded-lg border transition-all active:cursor-grabbing ${
        isHovered
          ? "border-violet-500 scale-[1.02]"
          : "border-white/10 hover:border-white/20"
      }`}
      style={{ width: 128, height: 88 }}
    >
      {/* Thumbnail */}
      <div className="relative flex-1 overflow-hidden bg-white/5">
        {shot.video_url ? (
          <video src={shot.video_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
        ) : shot.image_url ? (
          <img src={shot.image_url} alt={shot.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-white/30">No clip yet</span>
          </div>
        )}

        {/* Index badge */}
        <span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-xs text-white/70">
          {index + 1}
        </span>

        {/* Status dot */}
        <span className={`absolute right-1 top-1 h-2 w-2 rounded-full ${STATUS_DOT[shot.status]}`} />
      </div>

      {/* Title bar */}
      <div className="shrink-0 bg-[#0a0a14] px-1.5 py-1">
        <p className="truncate text-xs text-white/50">{shot.title}</p>
      </div>
    </div>
  );
}
