"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { CharacterSheetPanel } from "./character-sheet-panel";
import { LocationBuilderPanel } from "./location-builder-panel";

const NODE_LABEL: Record<string, string> = {
  character: "Character",
  location:  "Location",
  prompt:    "Prompt",
  imageGen:  "Image Gen",
  videoGen:  "Video Gen",
  output:    "Output",
};

const NODE_ACCENT: Record<string, string> = {
  character: "text-violet-400",
  location:  "text-green-400",
  prompt:    "text-blue-400",
  imageGen:  "text-orange-400",
  videoGen:  "text-red-400",
  output:    "text-yellow-400",
};

interface NodeInspectorProps {
  projectId: string;
}

export function NodeInspector({ projectId }: NodeInspectorProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const selectedNodeId = useProjectStore((s) => s.selectedNodeId);
  const nodes         = useProjectStore((s) => s.nodes);
  const updateNodeData = useProjectStore((s) => s.updateNodeData);
  const deleteNode    = useProjectStore((s) => s.deleteNode);
  const selectNode    = useProjectStore((s) => s.selectNode);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const { data, type } = node;

  return (
    <aside className="flex h-full w-72 flex-col border-l border-white/10 bg-[#111111]/95 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${NODE_ACCENT[type] ?? "text-white/50"}`}>
            {NODE_LABEL[type] ?? type}
          </span>
          <span className="text-xs text-white/25">node</span>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="rounded p-0.5 text-white/30 hover:bg-white/5 hover:text-white/70 transition-colors"
        >
          <span className="material-symbols-rounded text-[18px]">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">

        {/* ── Character ────────────────────────────────────────── */}
        {type === "character" && (
          <>
            <Field label="Name">
              <Input
                value={data.characterName ?? ""}
                onChange={(e) => updateNodeData(node.id, { characterName: e.target.value })}
                placeholder="e.g. Maya"
              />
            </Field>
            <Field label="Reference photo">
              <ImageUpload
                value={data.characterImageUrl}
                onChange={(url) => updateNodeData(node.id, { characterImageUrl: url })}
                onClear={() => updateNodeData(node.id, { characterImageUrl: undefined, characterViews: undefined })}
                projectId={projectId}
                assetType="character"
                shape="circle"
                label="Drop photo or click"
              />
            </Field>
            {data.characterImageUrl && (
              <Field label="Reference sheet">
                <CharacterSheetPanel
                  nodeId={node.id}
                  projectId={projectId}
                  refUrl={data.characterImageUrl as string}
                  characterName={(data.characterName as string) ?? ""}
                  views={data.characterViews as string[] | undefined}
                />
              </Field>
            )}
          </>
        )}

        {/* ── Location ─────────────────────────────────────────── */}
        {type === "location" && (
          <>
            <Field label="Name">
              <Input
                value={data.locationName ?? ""}
                onChange={(e) => updateNodeData(node.id, { locationName: e.target.value })}
                placeholder="e.g. Tokyo Street"
              />
            </Field>
            <Field label="Reference image">
              <ImageUpload
                value={data.locationImageUrl && !data.locationPanoramaUrl ? (data.locationImageUrl as string) : undefined}
                onChange={(url) => updateNodeData(node.id, { locationImageUrl: url })}
                onClear={() => updateNodeData(node.id, { locationImageUrl: undefined })}
                projectId={projectId}
                assetType="location"
                shape="rect"
                label="Drop scene photo or click"
              />
            </Field>
            <Field label="Location builder">
              <LocationBuilderPanel
                nodeId={node.id}
                projectId={projectId}
                locationName={(data.locationName as string) ?? ""}
                currentDescription={data.locationDescription as string | undefined}
                panoramaUrl={data.locationPanoramaUrl as string | undefined}
              />
            </Field>
          </>
        )}

        {/* ── Prompt ───────────────────────────────────────────── */}
        {type === "prompt" && (
          <Field label="Shot description">
            <textarea
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/25 focus:border-blue-500/50 focus:outline-none leading-relaxed"
              rows={6}
              value={data.promptText ?? ""}
              onChange={(e) => updateNodeData(node.id, { promptText: e.target.value })}
              placeholder="A cinematic close-up of…"
            />
            <button
              disabled={!data.promptText || isEnhancing}
              onClick={async () => {
                setIsEnhancing(true);
                try {
                  const res = await fetch("/api/enhance-prompt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: data.promptText, mode: "shot" }),
                  });
                  const d = await res.json() as { enhanced?: string; error?: string };
                  if (!res.ok) throw new Error(d.error);
                  updateNodeData(node.id, { promptText: d.enhanced });
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Enhance failed");
                } finally {
                  setIsEnhancing(false);
                }
              }}
              className="flex items-center gap-1.5 self-end rounded-md px-2.5 py-1.5 text-xs text-amber-400/70 transition-colors hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-30"
            >
              {isEnhancing
                ? <span className="material-symbols-rounded text-[13px] animate-spin">progress_activity</span>
                : <span className="material-symbols-rounded text-[13px]">auto_fix_high</span>
              }
              {isEnhancing ? "Enhancing…" : "Enhance with AI"}
            </button>
          </Field>
        )}

        {/* ── ImageGen ─────────────────────────────────────────── */}
        {type === "imageGen" && (
          <>
            <Field label="Status">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${
                  data.generationStatus === "completed" ? "bg-green-400"
                  : data.generationStatus === "failed" ? "bg-red-400"
                  : data.generationStatus === "pending" || data.generationStatus === "processing" ? "bg-orange-400 animate-pulse"
                  : "bg-white/20"
                }`} />
                <p className="text-sm capitalize text-white/60">{data.generationStatus ?? "idle"}</p>
              </div>
            </Field>
            {data.outputUrl && (
              <Field label="Generated image">
                <img src={data.outputUrl as string} alt="Generated" className="w-full rounded-lg" />
              </Field>
            )}
          </>
        )}

        {/* ── VideoGen ─────────────────────────────────────────── */}
        {type === "videoGen" && (
          <>
            <Field label="Status">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${
                  data.generationStatus === "completed" ? "bg-green-400"
                  : data.generationStatus === "failed" ? "bg-red-400"
                  : data.generationStatus === "pending" || data.generationStatus === "processing" ? "bg-red-400 animate-pulse"
                  : "bg-white/20"
                }`} />
                <p className="text-sm capitalize text-white/60">{data.generationStatus ?? "idle"}</p>
              </div>
            </Field>
            {data.outputUrl && (
              <Field label="Generated clip">
                <video src={data.outputUrl as string} controls muted loop className="w-full rounded-lg" />
              </Field>
            )}
          </>
        )}

        {/* ── Output ───────────────────────────────────────────── */}
        {type === "output" && (
          <Field label="Clip order">
            <Input
              type="number"
              min={1}
              value={(data.clipOrder ?? 0) + 1}
              onChange={(e) =>
                updateNodeData(node.id, { clipOrder: Math.max(0, Number(e.target.value) - 1) })
              }
            />
            <p className="mt-1 text-xs text-white/30">Position of this clip in the final composition</p>
          </Field>
        )}

        <div className="border-t border-white/[0.06] pt-2">
          <p className="truncate font-mono text-xs text-white/20">{node.id}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => deleteNode(node.id)}
        >
          <span className="material-symbols-rounded text-[18px]">delete</span>
          Delete node
        </Button>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-white/35">
        {label}
      </label>
      {children}
    </div>
  );
}
