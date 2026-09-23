"use client";

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

const IMAGE_MODELS: { value: ImageModel; label: string; note?: string }[] = [
  { value: "fal/flux-pro",            label: "FLUX Pro",             note: "Best quality" },
  { value: "fal/flux-lora",           label: "FLUX LoRA",            note: "Style control" },
  { value: "fal/stable-diffusion-xl", label: "SDXL",                 note: "Faster" },
];

const VIDEO_MODELS: { value: VideoModel; label: string; note?: string }[] = [
  { value: "fal/minimax-h3-max", label: "MiniMax H3 Max", note: "Best value" },
  { value: "fal/seedance-2-5",   label: "Seedance 2.5",   note: "Max quality · ~$1.50/clip" },
  { value: "fal/kling-v3",       label: "Kling v3",       note: "Smooth motion" },
  { value: "fal/wan-3",          label: "Wan 3.0",         note: "Budget" },
];

const CAMERA_MOTIONS: { value: string; label: string; icon: string }[] = [
  { value: "static",    label: "Static",    icon: "crop_free" },
  { value: "zoom-in",   label: "Zoom In",   icon: "zoom_in" },
  { value: "zoom-out",  label: "Zoom Out",  icon: "zoom_out" },
  { value: "pan-left",  label: "Pan Left",  icon: "arrow_back" },
  { value: "pan-right", label: "Pan Right", icon: "arrow_forward" },
  { value: "tilt-up",   label: "Tilt Up",   icon: "arrow_upward" },
  { value: "tilt-down", label: "Tilt Down", icon: "arrow_downward" },
];

const TRANSITIONS: { value: string; label: string; desc: string }[] = [
  { value: "none",     label: "Cut",     desc: "Hard cut between clips" },
  { value: "fade",     label: "Fade",    desc: "Fade to black between clips" },
  { value: "dissolve", label: "Dissolve", desc: "Cross-dissolve overlap" },
];

const STYLE_PRESETS = [
  "Cinematic", "Documentary", "Commercial",
  "Music video", "Anime", "Noir", "Vintage", "Minimalist",
];

export function ProjectSettingsPanel({ open, onClose }: ProjectSettingsPanelProps) {
  const settings = useProjectStore((s) => s.settings);
  const updateSettings = useProjectStore((s) => s.updateSettings);

  if (!open) return null;

  const set = <K extends keyof ProjectSettings>(key: K, val: ProjectSettings[K]) =>
    updateSettings({ [key]: val });

  const estimatedShots = Math.ceil(settings.totalDuration / (settings.shotDuration || 5));
  const costPerShot = COST_PER_SHOT[settings.videoModel] ?? 0.08;
  const estimatedCost = estimatedShots * (0.05 + costPerShot * (settings.shotDuration || 5));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-white/[0.08] bg-[#0d0d0d] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <p className="text-sm font-semibold text-white/80">Project Settings</p>
          <button onClick={onClose} className="rounded p-1 text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/70">
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-0 overflow-y-auto divide-y divide-white/[0.06]">

          {/* Aspect Ratio */}
          <Section label="Aspect Ratio">
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => set("aspectRatio", ar.value)}
                  className={`flex flex-col items-center gap-0.5 rounded border py-2.5 text-xs transition-colors ${
                    settings.aspectRatio === ar.value
                      ? "border-white/40 bg-white/[0.07] text-white"
                      : "border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  <span className="font-semibold">{ar.label}</span>
                  <span className="text-[9px] opacity-60">{ar.desc}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Resolution + FPS */}
          <Section label="Output Quality">
            <div className="grid grid-cols-2 gap-2">
              {/* Resolution */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/25">Resolution</span>
                <div className="flex gap-1.5">
                  {(["720p", "1080p"] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => set("outputResolution", res)}
                      className={`flex-1 rounded border py-2 text-xs font-medium transition-colors ${
                        settings.outputResolution === res
                          ? "border-white/40 bg-white/[0.07] text-white"
                          : "border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/60"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/25">Frame Rate</span>
                <div className="flex gap-1.5">
                  {([24, 30] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => set("fps", f)}
                      className={`flex-1 rounded border py-2 text-xs font-medium transition-colors ${
                        settings.fps === f
                          ? "border-white/40 bg-white/[0.07] text-white"
                          : "border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/60"
                      }`}
                    >
                      {f} fps
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Duration */}
          <Section label="Film Length">
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                label="Total duration (s)"
                min={5} max={300} step={5}
                value={settings.totalDuration}
                onChange={(v) => set("totalDuration", v)}
              />
              <NumericField
                label="Scenes"
                min={1} max={20} step={1}
                value={settings.numScenes}
                onChange={(v) => set("numScenes", v)}
              />
            </div>
          </Section>

          {/* Shot Duration */}
          <Section label="Shot Controls">
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                label="Clip length (s)"
                min={3} max={10} step={1}
                value={settings.shotDuration}
                onChange={(v) => set("shotDuration", v)}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/25">Char. strength</span>
                <div className="flex flex-col gap-1">
                  <input
                    type="range"
                    min={0.1} max={1.0} step={0.05}
                    value={settings.characterStrength}
                    onChange={(e) => set("characterStrength", parseFloat(e.target.value))}
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-[10px] text-white/25">
                    <span>Loose</span>
                    <span className="text-white/50">{settings.characterStrength.toFixed(2)}</span>
                    <span>Strict</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-white/20">
              Approx. {estimatedShots} shots · {settings.shotDuration}s each
            </p>
          </Section>

          {/* Style */}
          <Section label="Visual Style">
            <input
              className="mb-2 w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
              placeholder="e.g. Warm cinematic tones, shallow depth of field"
              value={settings.style}
              onChange={(e) => set("style", e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => set("style", preset)}
                  className={`rounded border px-2.5 py-1 text-[10px] transition-colors ${
                    settings.style === preset
                      ? "border-white/35 bg-white/[0.07] text-white"
                      : "border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/55"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </Section>

          {/* Camera Motion */}
          <Section label="Default Camera Motion">
            <div className="grid grid-cols-4 gap-1.5">
              {CAMERA_MOTIONS.map((cm) => (
                <button
                  key={cm.value}
                  onClick={() => set("cameraMotion", cm.value as ProjectSettings["cameraMotion"])}
                  title={cm.label}
                  className={`flex flex-col items-center gap-1 rounded border py-2 text-[10px] transition-colors ${
                    settings.cameraMotion === cm.value
                      ? "border-white/40 bg-white/[0.07] text-white"
                      : "border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  <span className="material-symbols-rounded text-[16px]">{cm.icon}</span>
                  {cm.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/20">Applied when Director doesn't specify motion. Kling v3 only.</p>
          </Section>

          {/* Transitions */}
          <Section label="Clip Transitions">
            <div className="flex flex-col gap-1.5">
              {TRANSITIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => set("transition", t.value as ProjectSettings["transition"])}
                  className={`flex items-center justify-between rounded border px-3 py-2.5 text-left transition-colors ${
                    settings.transition === t.value
                      ? "border-white/35 bg-white/[0.06] text-white"
                      : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/65"
                  }`}
                >
                  <span className="text-xs font-medium">{t.label}</span>
                  <span className="text-[10px] text-white/25">{t.desc}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Negative Prompt */}
          <Section label="Negative Prompt">
            <textarea
              rows={3}
              className="w-full resize-none rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
              placeholder="blur, overexposed, watermark, deformed anatomy…"
              value={settings.negativePrompt}
              onChange={(e) => set("negativePrompt", e.target.value)}
            />
            <p className="text-[10px] text-white/20">Applied to every shot during generation</p>
          </Section>

          {/* Image Model */}
          <Section label="Image Model">
            <div className="flex flex-col gap-1.5">
              {IMAGE_MODELS.map((m) => (
                <ModelOption
                  key={m.value}
                  label={m.label}
                  note={m.note}
                  active={settings.imageModel === m.value}
                  onClick={() => set("imageModel", m.value as ImageModel)}
                />
              ))}
            </div>
          </Section>

          {/* Video Model */}
          <Section label="Video Model">
            <div className="flex flex-col gap-1.5">
              {VIDEO_MODELS.map((m) => (
                <ModelOption
                  key={m.value}
                  label={m.label}
                  note={m.note}
                  active={settings.videoModel === m.value}
                  onClick={() => set("videoModel", m.value as VideoModel)}
                />
              ))}
            </div>
          </Section>

          {/* Style Reference */}
          <Section label="Style Reference">
            <ImageUpload
              value={settings.styleRefUrl}
              onChange={(url) => set("styleRefUrl", url)}
              onClear={() => updateSettings({ styleRefUrl: undefined })}
              projectId="global"
              assetType="location"
              shape="rect"
              label="Drop a style reference image"
            />
            <p className="text-[10px] text-white/20">Passed to every shot for visual consistency</p>
          </Section>

          {/* Cost Estimate */}
          <div className="px-5 py-4">
            <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25">Estimated cost</p>
              <p className="mt-1 text-xl font-semibold text-white/70">
                ~${estimatedCost.toFixed(2)}
              </p>
              <p className="mt-0.5 text-[10px] text-white/25">
                {estimatedShots} shots · {settings.outputResolution} · {settings.fps}fps
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

const COST_PER_SHOT: Record<VideoModel, number> = {
  "fal/minimax-h3-max": 0.08,
  "fal/seedance-2-5":   0.30,
  "fal/kling-v3":       0.22,
  "fal/wan-3":          0.10,
  "comfyui/wan":        0,
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">{label}</p>
      {children}
    </div>
  );
}

function NumericField({ label, min, max, step, value, onChange }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-white/25">{label}</span>
      <input
        type="number"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-white/25 focus:outline-none"
      />
    </div>
  );
}

function ModelOption({ label, note, active, onClick }: {
  label: string; note?: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded border px-3 py-2.5 text-left transition-colors ${
        active
          ? "border-white/35 bg-white/[0.06] text-white"
          : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/65"
      }`}
    >
      <span className="text-xs font-medium">{label}</span>
      {note && <span className="text-[10px] text-white/25">{note}</span>}
    </button>
  );
}
