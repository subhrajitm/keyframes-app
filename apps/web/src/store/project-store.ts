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
  | "output"
  | "audioGen";

export interface NodeData extends Record<string, unknown> {
  label: string;
  characterName?: string;
  characterImageUrl?: string;
  characterViews?: string[]; // [front, side, quarter] generated views
  locationName?: string;
  locationDescription?: string;
  locationImageUrl?: string;
  locationPanoramaUrl?: string; // generated panoramic image
  promptText?: string;
  generationId?: string;
  generationStatus?: "idle" | "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  clipOrder?: number;
  audioText?: string;
  audioType?: "narration" | "ambient";
  audioVoice?: string;
  audioUrl?: string;
}

export interface ProjectSettings {
  aspectRatio: AspectRatio;
  style: string;
  totalDuration: number;
  numScenes: number;
  /** Duration per individual clip in seconds */
  shotDuration: number;
  /** Frame rate for video generation */
  fps: 24 | 30;
  /** Output resolution for image generation */
  outputResolution: "720p" | "1080p";
  /** Global negative prompt applied to every shot */
  negativePrompt: string;
  /** IP-adapter scale for character reference images (0.1–1.0) */
  characterStrength: number;
  imageModel: ImageModel;
  videoModel: VideoModel;
  /** URL of a style reference image passed to fal.ai for visual consistency */
  styleRefUrl?: string;
  /** Default camera motion applied to all shots */
  cameraMotion: "static" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down";
  /** Transition style between clips during composition */
  transition: "none" | "fade" | "dissolve";
  /** Post-processing VFX filter applied to the final composed video */
  vfxEffect: "none" | "film-grain" | "vignette" | "warm" | "cool" | "noir" | "cinematic" | "letterbox";
  /** Number of image variations to generate per shot */
  numVariations: 1 | 2 | 3 | 4;
  /** Ordered shot IDs for final composition — set by the Timeline panel */
  clipOrder?: string[];
  /** Background music URL mixed in during compose */
  musicUrl?: string;
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  aspectRatio: "16:9",
  style: "",
  totalDuration: 30,
  numScenes: 3,
  shotDuration: 5,
  fps: 24,
  outputResolution: "720p",
  negativePrompt: "",
  characterStrength: 0.6,
  imageModel: "fal/flux-pro",
  videoModel: "fal/minimax-h3-max",
  cameraMotion: "static",
  transition: "none",
  vfxEffect: "none",
  numVariations: 1,
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

  addNode: (type: NodeType, position: { x: number; y: number }, extraData?: Partial<NodeData>) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;

  loadGraph: (nodes: KFNode[], edges: KFEdge[], settings?: Partial<ProjectSettings>) => void;
  revealGraph: (nodes: KFNode[], edges: KFEdge[]) => void;
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
    audioGen: { label: "Audio Gen", audioType: "narration", audioText: "" },
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
          { ...connection, animated: false, style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 } },
          s.edges
        ),
        isDirty: true,
      }));
    },

    addNode: (type, position, extraData) => {
      const id = makeNodeId(type);
      const newNode: KFNode = {
        id, type, position,
        data: { ...defaultDataForType(type), ...extraData },
      };
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

    revealGraph: (allNodes, allEdges) => {
      // Clear canvas first
      set({ nodes: [], edges: [], isDirty: false });

      // Group nodes + edges by shot prefix (e.g. "s0_sh2")
      const SHOT_RE = /^(s\d+_sh\d+)_/;
      const groups = new Map<string, { nodes: KFNode[]; edges: KFEdge[] }>();

      for (const node of allNodes) {
        const key = node.id.match(SHOT_RE)?.[1] ?? "misc";
        if (!groups.has(key)) groups.set(key, { nodes: [], edges: [] });
        groups.get(key)!.nodes.push(node);
      }
      for (const edge of allEdges) {
        const key = edge.source.match(SHOT_RE)?.[1] ?? "misc";
        if (!groups.has(key)) groups.set(key, { nodes: [], edges: [] });
        groups.get(key)!.edges.push(edge);
      }

      const list = [...groups.values()];
      list.forEach((group, i) => {
        setTimeout(() => {
          set((s) => ({
            nodes: [...s.nodes, ...group.nodes],
            edges: [...s.edges, ...group.edges],
            isDirty: i === list.length - 1,
          }));
        }, i * 220);
      });
    },

    markSaved: () => set({ isDirty: false, isSaving: false }),
    markSaving: () => set({ isSaving: true }),
  }))
);
