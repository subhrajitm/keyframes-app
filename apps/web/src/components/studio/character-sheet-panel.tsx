"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/project-store";

interface CharacterSheetPanelProps {
  nodeId: string;
  projectId: string;
  refUrl: string;
  characterName: string;
  views?: string[];
}

const VIEW_LABELS = ["Front", "Side", "3/4"];

export function CharacterSheetPanel({
  nodeId, projectId, refUrl, characterName, views,
}: CharacterSheetPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const updateNodeData = useProjectStore((s) => s.updateNodeData);

  const generate = async () => {
    setIsGenerating(true);
    const tid = toast.loading("Generating character reference sheet…");
    try {
      const res = await fetch("/api/characters/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refUrl, characterName, projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const { front, side, quarter } = data.views as { front: string; side: string; quarter: string };
      const newViews = [front, side, quarter];
      updateNodeData(nodeId, { characterViews: newViews, characterImageUrl: front });
      toast.success("Reference sheet generated", { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { id: tid });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectView = (url: string) => {
    updateNodeData(nodeId, { characterImageUrl: url });
    toast.success("Primary reference updated");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Generate button */}
      <button
        onClick={generate}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 py-2 text-xs font-medium text-violet-300 transition-colors hover:border-violet-500/50 hover:bg-violet-500/20 disabled:opacity-40"
      >
        {isGenerating ? (
          <span className="material-symbols-rounded text-[14px] animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-rounded text-[14px]">refresh</span>
        )}
        {isGenerating ? "Generating…" : views?.length ? "Regenerate Sheet" : "Generate Reference Sheet"}
      </button>

      {/* Views grid */}
      {views?.length ? (
        <div className="grid grid-cols-3 gap-1.5">
          {views.map((url, i) => (
            <button
              key={i}
              onClick={() => selectView(url)}
              className="group relative flex flex-col gap-1 rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/40 transition-colors"
              title={`Use ${VIEW_LABELS[i]} view as primary reference`}
            >
              <img src={url} alt={VIEW_LABELS[i]} className="aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="material-symbols-rounded text-[18px] text-white">check</span>
                <span className="text-[10px] text-white">Use</span>
              </div>
              <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/50">
                {VIEW_LABELS[i]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-[10px] text-white/25">
          Generate a front, side, and 3/4 view from your reference photo
        </p>
      )}
    </div>
  );
}
