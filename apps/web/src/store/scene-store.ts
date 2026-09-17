"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Scene, Shot } from "@keyframe/types";

export interface SceneWithShots extends Scene {
  shots: Shot[];
}

interface SceneStore {
  projectId: string;
  scenes: SceneWithShots[];
  isLoading: boolean;
  error: string | null;

  loadScenes: (projectId: string) => Promise<void>;
  updateShotStatus: (shotId: string, update: Partial<Shot>) => void;
  subscribeRealtime: (projectId: string) => () => void;
  reset: () => void;
}

export const useSceneStore = create<SceneStore>()((set, get) => ({
  projectId: "",
  scenes: [],
  isLoading: false,
  error: null,

  loadScenes: async (projectId) => {
    set({ isLoading: true, error: null, projectId });
    const supabase = createClient();

    const { data: scenes, error: sceneErr } = await supabase
      .from("scenes")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index");

    if (sceneErr) {
      set({ isLoading: false, error: sceneErr.message });
      return;
    }

    const { data: shots, error: shotErr } = await supabase
      .from("shots")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index");

    if (shotErr) {
      set({ isLoading: false, error: shotErr.message });
      return;
    }

    const shotsByScene = (shots ?? []).reduce<Record<string, Shot[]>>((acc, shot) => {
      if (!acc[shot.scene_id]) acc[shot.scene_id] = [];
      acc[shot.scene_id].push(shot);
      return acc;
    }, {});

    const scenesWithShots: SceneWithShots[] = (scenes ?? []).map((scene) => ({
      ...scene,
      shots: shotsByScene[scene.id] ?? [],
    }));

    set({ scenes: scenesWithShots, isLoading: false });
  },

  updateShotStatus: (shotId, update) => {
    set((s) => ({
      scenes: s.scenes.map((scene) => ({
        ...scene,
        shots: scene.shots.map((shot) =>
          shot.id === shotId ? { ...shot, ...update } : shot
        ),
      })),
    }));
  },

  subscribeRealtime: (projectId) => {
    const supabase = createClient();

    const channel = supabase
      .channel(`shots:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shots",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const updated = payload.new as Shot;
          get().updateShotStatus(updated.id, updated);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shots",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Re-fetch on new shots
          get().loadScenes(projectId);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },

  reset: () => set({ projectId: "", scenes: [], isLoading: false, error: null }),
}));
