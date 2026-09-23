"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CharacterNode } from "@/components/nodes/character-node";
import { LocationNode } from "@/components/nodes/location-node";
import { PromptNode } from "@/components/nodes/prompt-node";
import { ImageGenNode } from "@/components/nodes/image-gen-node";
import { VideoGenNode } from "@/components/nodes/video-gen-node";
import { OutputNode } from "@/components/nodes/output-node";
import { AudioGenNode } from "@/components/nodes/audio-gen-node";
import { useProjectStore, type NodeType, type KFNode, type KFEdge } from "@/store/project-store";
import { NodeInspector } from "@/components/studio/node-inspector";
import { CanvasToolbar } from "@/components/studio/canvas-toolbar";
import { createClient } from "@/lib/supabase/client";

const NODE_TYPES: NodeTypes = {
  character: CharacterNode,
  location: LocationNode,
  prompt: PromptNode,
  imageGen: ImageGenNode,
  videoGen: VideoGenNode,
  output: OutputNode,
  audioGen: AudioGenNode,
};

interface StudioCanvasProps {
  projectId: string;
  panelOpen: boolean;
  onTogglePanel: () => void;
  timelineOpen: boolean;
  onToggleTimeline: () => void;
  directorOpen: boolean;
  onToggleDirector: () => void;
}

export function StudioCanvas({ projectId, panelOpen, onTogglePanel, timelineOpen, onToggleTimeline, directorOpen, onToggleDirector }: StudioCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    markSaved,
    markSaving,
    isDirty,
    selectedNodeId,
    selectNode,
  } = useProjectStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  // Initial graph is loaded by StudioShell to avoid double-load

  // Autosave: debounce 2s after last change
  useEffect(() => {
    if (!isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      markSaving();
      const { nodes: current, edges: currentEdges, settings } = useProjectStore.getState();
      await supabase
        .from("projects")
        .update({ graph_state: { nodes: current, edges: currentEdges, settings } as unknown as import("@keyframe/types").Json })
        .eq("id", projectId);
      markSaved();
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  // Drop node from palette or asset library
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/keyframe-node") as NodeType;
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 110,
        y: e.clientY - bounds.top - 60,
      };

      // Check if an asset was dragged (from asset library)
      const assetRaw = e.dataTransfer.getData("application/keyframe-asset");
      if (assetRaw) {
        try {
          const asset = JSON.parse(assetRaw) as { id: string; url: string; name: string; type: string };
          const extraData =
            asset.type === "character"
              ? { characterImageUrl: asset.url, characterName: asset.name }
              : asset.type === "location"
              ? { locationImageUrl: asset.url, locationName: asset.name }
              : { outputUrl: asset.url };
          addNode(type, position, extraData);
          return;
        } catch { /* fall through to plain add */ }
      }

      addNode(type, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div ref={reactFlowWrapper} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={() => selectNode(null)}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={2}
        deleteKeyCode="Delete"
        defaultEdgeOptions={{
          style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
          animated: false,
        }}
        style={{ backgroundColor: "#080808" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#ffffff0e"
        />
        <Controls
          className="!border-white/10 !bg-[#161616] !text-white/40 !shadow-none"
          showInteractive={false}
          position="bottom-left"
          style={{ bottom: 80 }}
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/15">Use the Director bar above, or press <span className="font-semibold text-white/25">+ Add</span> below</p>
          </div>
        )}
      </ReactFlow>

      {/* Floating bottom toolbar */}
      <CanvasToolbar
        panelOpen={panelOpen}
        onTogglePanel={onTogglePanel}
        timelineOpen={timelineOpen}
        onToggleTimeline={onToggleTimeline}
        directorOpen={directorOpen}
        onToggleDirector={onToggleDirector}
      />

      {/* Slide-in node inspector overlay */}
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-20 flex transition-transform duration-200 ease-out ${
          selectedNodeId ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        }`}
      >
        <NodeInspector projectId={projectId} />
      </div>
    </div>
  );
}
