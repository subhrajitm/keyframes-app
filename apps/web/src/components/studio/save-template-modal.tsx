"use client";

import { useState } from "react";

import { toast } from "sonner";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["Commercial", "Entertainment", "Documentary", "Music Video", "Tutorial", "Other"];

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export function SaveTemplateModal({ open, onClose, projectId, projectTitle }: SaveTemplateModalProps) {
  const [title, setTitle] = useState(projectTitle);
  const [category, setCategory] = useState("Commercial");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const settings = useProjectStore((s) => s.settings);

  if (!open) return null;

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Enter a template title"); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title: title.trim(), category, description: description.trim(), settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast.success(`"${title}" saved to template gallery`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d0d1a] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px] text-violet-400">library_books</span>
            <h2 className="text-sm font-semibold text-white/90">Save as Template</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Template Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Coffee Brand Promo"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    category === cat
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
              Description <span className="font-normal normal-case text-white/20">(optional)</span>
            </label>
            <textarea
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/20 focus:border-violet-500/60 focus:outline-none"
              rows={2}
              placeholder="Briefly describe what this template creates…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Settings preview */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/20">Settings saved with template</p>
            <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
              <span>{settings.totalDuration}s total</span>
              <span>·</span>
              <span>{settings.numScenes} scenes</span>
              <span>·</span>
              <span>{settings.aspectRatio}</span>
              {settings.style && <><span>·</span><span>{settings.style}</span></>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <span className="material-symbols-rounded text-[14px] animate-spin">progress_activity</span> : <span className="material-symbols-rounded text-[14px]">library_books</span>}
            {isSaving ? "Saving…" : "Save Template"}
          </Button>
        </div>
      </div>
    </>
  );
}
