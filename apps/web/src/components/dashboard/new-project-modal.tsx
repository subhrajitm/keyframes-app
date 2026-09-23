"use client";

import { useEffect, useRef } from "react";
import { createProject } from "@/app/(dashboard)/dashboard/actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const fieldCls = "w-full rounded border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15";

export function NewProjectModal({ open, onClose }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => nameRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[420px]">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">New project</h2>
        <p className="mt-0.5 text-xs text-white/40">
          Name your project and optionally describe what you want to make.
        </p>
      </div>

      <form action={createProject} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-white/50">
            Name <span className="text-red-400/70">*</span>
          </label>
          <input
            ref={nameRef}
            name="name"
            required
            maxLength={80}
            placeholder="My cinematic project"
            className={fieldCls}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-white/50">
            Description{" "}
            <span className="font-normal text-white/25">(optional — pre-fills the Director)</span>
          </label>
          <textarea
            name="description"
            rows={3}
            maxLength={400}
            placeholder='e.g. "A 30-second coffee brand promo, warm cinematic tones, 3 scenes"'
            className={`${fieldCls} resize-none leading-relaxed`}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="violet" size="sm">
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
