"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/project-store";
import { PanoramaViewer } from "@/components/ui/panorama-viewer";

const STYLES = [
  { value: "cinematic",   label: "Cinematic" },
  { value: "realistic",   label: "Realistic" },
  { value: "fantasy",     label: "Fantasy" },
  { value: "noir",        label: "Noir" },
  { value: "documentary", label: "Documentary" },
  { value: "anime",       label: "Anime" },
];

interface LocationBuilderPanelProps {
  nodeId: string;
  projectId: string;
  locationName: string;
  currentDescription?: string;
  panoramaUrl?: string;
}

export function LocationBuilderPanel({
  nodeId, projectId, locationName, currentDescription, panoramaUrl,
}: LocationBuilderPanelProps) {
  const [prompt, setPrompt] = useState(currentDescription ?? "");
  const [style, setStyle] = useState("cinematic");
  const [isGenerating, setIsGenerating] = useState(false);
  const updateNodeData = useProjectStore((s) => s.updateNodeData);

  const generate = async () => {
    if (!prompt.trim()) { toast.error("Enter a location description first"); return; }
    setIsGenerating(true);
    const tid = toast.loading("Generating location panorama…");
    try {
      const res = await fetch("/api/locations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, locationName, projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      updateNodeData(nodeId, {
        locationPanoramaUrl: data.url,
        locationImageUrl: data.url,
        locationDescription: prompt.trim(),
      });
      toast.success("Location generated — drag to pan", { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Prompt */}
      <textarea
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/20 focus:border-green-500/60 focus:outline-none"
        rows={3}
        placeholder="Describe the location… e.g. neon-lit Tokyo alley at night, rain-soaked streets"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {/* Style */}
      <div className="flex flex-wrap gap-1">
        {STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStyle(s.value)}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
              style === s.value
                ? "border-green-500/50 bg-green-500/10 text-green-300"
                : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={isGenerating || !prompt.trim()}
        className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 py-2 text-xs font-medium text-green-300 transition-colors hover:border-green-500/50 hover:bg-green-500/20 disabled:opacity-40"
      >
        {isGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MapPin className="h-3.5 w-3.5" />
        )}
        {isGenerating ? "Generating…" : panoramaUrl ? "Regenerate Location" : "Generate Location"}
      </button>

      {/* Panorama viewer */}
      {panoramaUrl && (
        <PanoramaViewer url={panoramaUrl} className="aspect-[2/1] w-full" />
      )}
    </div>
  );
}
