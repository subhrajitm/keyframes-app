"use client";

import { X } from "lucide-react";
import { useProjectStore, type ProjectSettings } from "@/store/project-store";
import { ImageUpload } from "@/components/ui/image-upload";
import type { AspectRatio, ImageModel, VideoModel } from "@keyframe/types";

interface ProjectSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; desc: string }[] = [
  { value: "16:9", label: "16:9", desc: "Landscape" },
  { value: "9:16", label: "9:16", desc: "Portrait" },
  { value: "4:3",  label: "4:3",  desc: "Classic" },
  { value: "3:4",  label: "3:4",  desc: "Tall" },
  { value: "1:1",  label: "1:1",  desc: "Square" },
];

const IMAGE_MODELS: { value: ImageModel; label: string }[] = [
  { value: "fal/flux-pro",            label: "FLUX Pro (best quality)" },
  { value: "fal/flux-lora",           label: "FLUX LoRA (style control)" },
  { value: "fal/stable-diffusion-xl", label: "SDXL (faster)" },
];

const VIDEO_MODELS: { value: VideoModel; label: string }[] = [
  { value: "fal/minimax-h3-max", label: "MiniMax H3 Max (best value)" },
  { value: "fal/seedance-2-5",   label: "Seedance 2.5 (max quality)" },
  { value: "fal/kling-v3",       label: "Kling v3" },
  { value: "fal/wan-3",          label: "Wan 3.0 (budget)" },
];

const STYLE_PRESETS = [
  "Cinematic", "Documentary", "Commercial", "Music video",
  "Anime", "Noir", "Vintage", "Minimalist",
];

export function ProjectSettingsPanel({ open, onClose }: ProjectSettingsPanelProps) {
  const settings = useProjectStore((s) => s.settings);
  const updateSettings = useProjectStore((s) => s.updateSettings);

  if (!open) return null;

  const set = <K extends keyof ProjectSettings>(key: K, val: ProjectSettings[K]) =>
    updateSettings({ [key]: val });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-white/10 bg-[#0d0d1a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm font-semibold text-white/80">Project Settings</p>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          {/* Aspect Ratio */}
          <Section label="Aspect Ratio">
            <div className="grid grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => set("aspectRatio", ar.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs transition-colors ${
                    settings.aspectRatio === ar.value
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                  }`}
                >
                  <span className="font-medium">{ar.label}</span>
                  <span className="text-[10px] opacity-60">{ar.desc}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Style Preset */}
          <Section label="Visual Style">
            <input
              className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-violet-500/60 focus:outline-none"
              placeholder="e.g. Warm cinematic tones, shallow depth of field"
              value={settings.style}
              onChange={(e) => set("style", e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => set("style", preset)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] transition-colors ${
                    settings.style === preset
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </Section>

          {/* Duration + Scenes */}
          <Section label="Video Length">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/30">Total Duration (s)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  step={5}
                  value={settings.totalDuration}
                  onChange={(e) => set("totalDuration", Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/30">Scenes</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.numScenes}
                  onChange={(e) => set("numScenes", Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                />
              </div>
            </div>
          </Section>

          {/* Image Model */}
          <Section label="Image Model">
            <select
              value={settings.imageModel}
              onChange={(e) => set("imageModel", e.target.value as ImageModel)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d1a] px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Section>

          {/* Video Model */}
          <Section label="Video Model">
            <select
              value={settings.videoModel}
              onChange={(e) => set("videoModel", e.target.value as VideoModel)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d1a] px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
            >
              {VIDEO_MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {settings.videoModel === "fal/seedance-2-5" && (
              <p className="mt-1.5 text-[10px] text-yellow-400/70">
                Premium model — ~$0.30/s (~$1.50 per 5s clip)
              </p>
            )}
          </Section>

          {/* Style Reference Image */}
          <Section label="Style Reference (optional)">
            <ImageUpload
              value={settings.styleRefUrl}
              onChange={(url) => set("styleRefUrl", url)}
              onClear={() => updateSettings({ styleRefUrl: undefined })}
              projectId="global"
              assetType="location"
              shape="rect"
              label="Drop a style reference image"
            />
            <p className="text-[10px] text-white/25">Passed to every image generation for visual consistency</p>
          </Section>

          {/* Cost estimate */}
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/30">Estimated cost</p>
            <p className="mt-1 text-sm font-medium text-white/70">
              ~${estimateCost(settings).toFixed(2)}
            </p>
            <p className="mt-0.5 text-[10px] text-white/30">
              {Math.ceil(settings.totalDuration / 5)} shots · {settings.totalDuration}s total
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function estimateCost(s: ProjectSettings): number {
  const shots = Math.ceil(s.totalDuration / 5);
  const imageCost = shots * 0.05;
  const videoCostPerSec: Record<VideoModel, number> = {
    "fal/minimax-h3-max": 0.08,
    "fal/seedance-2-5":   0.30,
    "fal/kling-v3":       0.22,
    "fal/wan-3":          0.10,
    "comfyui/wan":        0,
  };
  const videoCost = s.totalDuration * (videoCostPerSec[s.videoModel] ?? 0.08);
  return imageCost + videoCost;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</p>
      {children}
    </div>
  );
}
