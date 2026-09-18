"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { ImageModel, VideoModel, AspectRatio } from "@keyframe/types";

export type NodeType =
  | "character"
  | "location"
  | "prompt"
  | "imageGen"
  | "videoGen"
  | "output";

export interface NodeData extends Record<string, unknown> {
  label: string;
  characterName?: string;
  characterImageUrl?: string;
  locationName?: string;
  locationDescription?: string;
  locationImageUrl?: string;
  promptText?: string;
  generationId?: string;
  generationStatus?: "idle" | "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  clipOrder?: number;
}

export interface ProjectSettings {
  aspectRatio: AspectRatio;
  style: string;
  totalDuration: number;
  numScenes: number;
  imageModel: ImageModel;
  videoModel: VideoModel;
  /** URL of a style reference image passed to fal.ai for visual consistency */
  styleRefUrl?: string;
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  aspectRatio: "16:9",
  style: "",
  totalDuration: 30,
  numScenes: 3,
  imageModel: "fal/flux-pro",
  videoModel: "fal/minimax-h3-max",
};

export type KFNode = Node<NodeData, NodeType>;
export type KFEdge = Edge;

interface ProjectStore {
  projectId: string;
  nodes: KFNode[];
  edges: KFEdge[];
  settings: ProjectSettings;
  selectedNodeId: string | null;
  isDirty: boolean;
  isSaving: boolean;

  onNodesChange: (changes: NodeChange<KFNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;

  loadGraph: (nodes: KFNode[], edges: KFEdge[], settings?: Partial<ProjectSettings>) => void;
  markSaved: () => void;
  markSaving: () => void;
}

let nodeCounter = 0;

function makeNodeId(type: NodeType) {
  return `${type}-${Date.now()}-${++nodeCounter}`;
}

function defaultDataForType(type: NodeType): NodeData {
  const defaults: Record<NodeType, NodeData> = {
    character: { label: "Character", characterName: "New Character" },
    location: { label: "Location", locationName: "New Location", locationDescription: "" },
    prompt: { label: "Prompt", promptText: "" },
    imageGen: { label: "Image Gen", generationStatus: "idle" },
    videoGen: { label: "Video Gen", generationStatus: "idle" },
    output: { label: "Output", clipOrder: 0 },
  };
  return defaults[type];
}

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    projectId: "",
    nodes: [],
    edges: [],
    settings: DEFAULT_SETTINGS,
    selectedNodeId: null,
    isDirty: false,
    isSaving: false,

    onNodesChange: (changes) => {
      set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as KFNode[], isDirty: true }));
    },

    onEdgesChange: (changes) => {
      set((s) => ({ edges: applyEdgeChanges(changes, s.edges), isDirty: true }));
    },

    onConnect: (connection) => {
      set((s) => ({
        edges: addEdge(
          { ...connection, animated: true, style: { stroke: "#7c3aed", strokeWidth: 2 } },
          s.edges
        ),
        isDirty: true,
      }));
    },

    addNode: (type, position) => {
      const id = makeNodeId(type);
      const newNode: KFNode = { id, type, position, data: defaultDataForType(type) };
      set((s) => ({ nodes: [...s.nodes, newNode], isDirty: true }));
      get().selectNode(id);
    },

    updateNodeData: (id, data) => {
      set((s) => ({
        nodes: s.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
        isDirty: true,
      }));
    },

    deleteNode: (id) => {
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== id),
        edges: s.edges.filter((e) => e.source !== id && e.target !== id),
        selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
        isDirty: true,
      }));
    },

    selectNode: (id) => set({ selectedNodeId: id }),

    updateSettings: (partial) => {
      set((s) => ({ settings: { ...s.settings, ...partial }, isDirty: true }));
    },

    loadGraph: (nodes, edges, settings) => set({
      nodes,
      edges,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      isDirty: false,
    }),

    markSaved: () => set({ isDirty: false, isSaving: false }),
    markSaving: () => set({ isSaving: true }),
  }))
);
