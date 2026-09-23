"use client";

import { useEffect, useRef } from "react";
import { createProject } from "@/app/(dashboard)/dashboard/actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Small delay so the animation starts before focus
      const t = setTimeout(() => nameRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-xl border border-white/[0.09] bg-[#111111] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">New project</h2>
          <p className="mt-0.5 text-sm text-white/35">
            Name your project and optionally describe what you want to make.
          </p>
        </div>

        <form action={createProject} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">
              Project name <span className="text-red-400/70">*</span>
            </label>
            <input
              ref={nameRef}
              name="name"
              required
              maxLength={80}
              placeholder="My cinematic project"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 transition-colors focus:border-white/20 focus:bg-white/[0.06] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">
              Description{" "}
              <span className="text-white/25 font-normal">(optional — pre-fills the Director)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              maxLength={400}
              placeholder='e.g. "A 30-second coffee brand promo, warm cinematic tones, 3 scenes"'
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 transition-colors focus:border-white/20 focus:bg-white/[0.06] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 active:opacity-80"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
