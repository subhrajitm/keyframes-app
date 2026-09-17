"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Shot } from "@keyframe/types";

interface ShotPreviewModalProps {
  shot: Shot | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  idle:              "text-white/30",
  image_pending:     "text-yellow-400",
  image_processing:  "text-orange-400",
  video_pending:     "text-yellow-400",
  video_processing:  "text-blue-400",
  completed:         "text-green-400",
  failed:            "text-red-400",
};

export function ShotPreviewModal({ shot, onClose, onPrev, onNext }: ShotPreviewModalProps) {
  if (!shot) return null;

  const spec = shot.shot_spec as Record<string, unknown>;
  const prompt = spec?.prompt as string | undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{shot.title}</p>
            <p className={`text-xs capitalize ${STATUS_COLORS[shot.status] ?? "text-white/30"}`}>
              {shot.status.replace(/_/g, " ")}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
          {shot.video_url ? (
            <video
              src={shot.video_url}
              controls
              autoPlay
              loop
              className="max-h-[60vh] w-full object-contain"
            />
          ) : shot.image_url ? (
            <img
              src={shot.image_url}
              alt={shot.title}
              className="max-h-[60vh] w-full object-contain"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-white/20 text-sm">
              {shot.status === "failed" ? shot.error ?? "Generation failed" : "Not yet generated"}
            </div>
          )}
        </div>

        {/* Prompt */}
        {prompt && (
          <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">{prompt}</p>
        )}

        {/* Prev / Next */}
        {(onPrev || onNext) && (
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-white/20 hover:text-white/80 disabled:opacity-20"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              onClick={onNext}
              disabled={!onNext}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-white/20 hover:text-white/80 disabled:opacity-20"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
