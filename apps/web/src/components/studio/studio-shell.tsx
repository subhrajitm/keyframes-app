"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { StudioToolbar } from "./studio-toolbar";
import { DirectorBar } from "./director-bar";
import { ScenePanel } from "./scene-panel";
import { StudioCanvas } from "./studio-canvas";
import { NodeInspector } from "./node-inspector";
import { createClient } from "@/lib/supabase/client";
import type { KFNode, KFEdge } from "@/store/project-store";

interface StudioShellProps {
  projectId: string;
  initialTitle: string;
  initialNodes: KFNode[];
  initialEdges: KFEdge[];
}

export function StudioShell({ projectId, initialTitle, initialNodes, initialEdges }: StudioShellProps) {
  const supabase = createClient();

  const handleTitleChange = async (title: string) => {
    await supabase.from("projects").update({ title }).eq("id", projectId);
  };

  return (
    <div className="flex h-screen flex-col bg-[#07070e] text-white">
      <StudioToolbar
        projectId={projectId}
        initialTitle={initialTitle}
        onTitleChange={handleTitleChange}
      />

      <DirectorBar projectId={projectId} />

      <div className="flex flex-1 overflow-hidden">
        <ScenePanel projectId={projectId} />

        <ReactFlowProvider>
          <main className="relative flex-1 overflow-hidden">
            <StudioCanvas
              projectId={projectId}
              initialNodes={initialNodes}
              initialEdges={initialEdges}
            />
          </main>
        </ReactFlowProvider>

        <NodeInspector projectId={projectId} />
      </div>
    </div>
  );
}
