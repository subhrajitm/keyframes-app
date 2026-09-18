"use client";

import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { CharacterSheetPanel } from "./character-sheet-panel";
import { LocationBuilderPanel } from "./location-builder-panel";

interface NodeInspectorProps {
  projectId: string;
}

export function NodeInspector({ projectId }: NodeInspectorProps) {
  const selectedNodeId = useProjectStore((s) => s.selectedNodeId);
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeData = useProjectStore((s) => s.updateNodeData);
  const deleteNode = useProjectStore((s) => s.deleteNode);
  const selectNode = useProjectStore((s) => s.selectNode);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside className="flex w-64 shrink-0 flex-col items-center justify-center border-l border-white/10 bg-[#0a0a12]">
        <p className="text-xs text-white/20">Select a node to edit it</p>
      </aside>
    );
  }

  const { data, type } = node;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-white/10 bg-[#0a0a12]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {type} node
        </p>
        <button
          onClick={() => selectNode(null)}
          className="text-white/30 hover:text-white/60"
        >
          <span className="material-symbols-rounded text-[18px]">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-3">
        {/* Character */}
        {type === "character" && (
          <>
            <Field label="Character Name">
              <Input
                value={data.characterName ?? ""}
                onChange={(e) => updateNodeData(node.id, { characterName: e.target.value })}
                placeholder="e.g. Maya"
              />
            </Field>
            <Field label="Reference Photo">
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
              <Field label="Reference Sheet">
                <CharacterSheetPanel
                  nodeId={node.id}
                  projectId={projectId}
                  refUrl={data.characterImageUrl as string}
                  characterName={data.characterName as string ?? ""}
                  views={data.characterViews as string[] | undefined}
                />
              </Field>
            )}
          </>
        )}

        {/* Location */}
        {type === "location" && (
          <>
            <Field label="Location Name">
              <Input
                value={data.locationName ?? ""}
                onChange={(e) => updateNodeData(node.id, { locationName: e.target.value })}
                placeholder="e.g. Tokyo Street"
              />
            </Field>
            <Field label="Upload Reference">
              <ImageUpload
                value={data.locationImageUrl && !data.locationPanoramaUrl ? data.locationImageUrl as string : undefined}
                onChange={(url) => updateNodeData(node.id, { locationImageUrl: url })}
                onClear={() => updateNodeData(node.id, { locationImageUrl: undefined })}
                projectId={projectId}
                assetType="location"
                shape="rect"
                label="Drop scene photo or click"
              />
            </Field>
            <Field label="Location Builder">
              <LocationBuilderPanel
                nodeId={node.id}
                projectId={projectId}
                locationName={data.locationName as string ?? ""}
                currentDescription={data.locationDescription as string | undefined}
                panoramaUrl={data.locationPanoramaUrl as string | undefined}
              />
            </Field>
          </>
        )}

        {/* Prompt */}
        {type === "prompt" && (
          <Field label="Prompt Text">
            <textarea
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/30 focus:border-blue-500/60 focus:outline-none"
              rows={5}
              value={data.promptText ?? ""}
              onChange={(e) => updateNodeData(node.id, { promptText: e.target.value })}
              placeholder="A cinematic close-up of…"
            />
          </Field>
        )}

        {/* ImageGen / VideoGen */}
        {(type === "imageGen" || type === "videoGen") && (
          <>
            <Field label="Status">
              <p className="text-xs capitalize text-white/50">{data.generationStatus ?? "idle"}</p>
            </Field>
            {data.outputUrl && (
              <Field label="Output">
                {type === "videoGen" ? (
                  <video
                    src={data.outputUrl}
                    controls
                    className="w-full rounded-lg"
                    muted
                    loop
                  />
                ) : (
                  <img src={data.outputUrl} alt="Generated" className="w-full rounded-lg" />
                )}
              </Field>
            )}
          </>
        )}

        {/* Output */}
        {type === "output" && (
          <Field label="Clip Order">
            <Input
              type="number"
              min={1}
              value={(data.clipOrder ?? 0) + 1}
              onChange={(e) =>
                updateNodeData(node.id, { clipOrder: Math.max(0, Number(e.target.value) - 1) })
              }
            />
          </Field>
        )}

        <Field label="Node ID">
          <p className="truncate font-mono text-xs text-white/30">{node.id}</p>
        </Field>
      </div>

      {/* Delete */}
      <div className="mt-auto border-t border-white/10 p-3">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => deleteNode(node.id)}
        >
          <span className="material-symbols-rounded text-[18px]">delete</span>
          Delete Node
        </Button>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {label}
      </label>
      {children}
    </div>
  );
}
