"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeTypes,
  type OnInit,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CharacterNode } from "@/components/nodes/character-node";
import { LocationNode } from "@/components/nodes/location-node";
import { PromptNode } from "@/components/nodes/prompt-node";
import { ImageGenNode } from "@/components/nodes/image-gen-node";
import { VideoGenNode } from "@/components/nodes/video-gen-node";
import { OutputNode } from "@/components/nodes/output-node";
import { useProjectStore, type NodeType, type KFNode, type KFEdge } from "@/store/project-store";
import { createClient } from "@/lib/supabase/client";

const NODE_TYPES: NodeTypes = {
  character: CharacterNode,
  location: LocationNode,
  prompt: PromptNode,
  imageGen: ImageGenNode,
  videoGen: VideoGenNode,
  output: OutputNode,
};

interface StudioCanvasProps {
  projectId: string;
  initialNodes: KFNode[];
  initialEdges: KFEdge[];
}

export function StudioCanvas({ projectId, initialNodes, initialEdges }: StudioCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    loadGraph,
    markSaved,
    markSaving,
    isDirty,
  } = useProjectStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  // Load initial graph from server
  useEffect(() => {
    loadGraph(initialNodes, initialEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave: debounce 2s after last change
  useEffect(() => {
    if (!isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      markSaving();
      const { nodes: current, edges: currentEdges } = useProjectStore.getState();
      await supabase
        .from("projects")
        .update({ graph_state: { nodes: current, edges: currentEdges } as unknown as import("@keyframe/types").Json })
        .eq("id", projectId);
      markSaved();
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  // Drop node from palette
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/keyframe-node") as NodeType;
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      // We'll resolve the canvas position using the store's RF instance below
      const position = {
        x: e.clientX - bounds.left - 110,
        y: e.clientY - bounds.top - 60,
      };
      addNode(type, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode="Delete"
style={{ backgroundColor: "#07070e" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#ffffff14"
        />
        <Controls
          className="!border-white/10 !bg-[#0f0f1a] !text-white/60"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              character: "#a855f7",
              location: "#22c55e",
              prompt: "#3b82f6",
              imageGen: "#f97316",
              videoGen: "#ef4444",
              output: "#eab308",
            };
            return colors[n.type ?? ""] ?? "#ffffff20";
          }}
          maskColor="#07070ecc"
          className="!border-white/10 !bg-[#0f0f1a]"
        />

        {/* Empty state hint */}
        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-white/20">Drag nodes from the left panel onto the canvas</p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}
