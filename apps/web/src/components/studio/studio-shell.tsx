"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { StudioToolbar } from "./studio-toolbar";
import { DirectorBar } from "./director-bar";
import { StudioLeftPanel } from "./studio-left-panel";
import { StudioCanvas } from "./studio-canvas";
import { NodeInspector } from "./node-inspector";
import { ProjectSettingsPanel } from "./project-settings-panel";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore, type KFNode, type KFEdge, type ProjectSettings } from "@/store/project-store";

interface StudioShellProps {
  projectId: string;
  initialTitle: string;
  initialNodes: KFNode[];
  initialEdges: KFEdge[];
  initialSettings?: Partial<ProjectSettings>;
}

export function StudioShell({ projectId, initialTitle, initialNodes, initialEdges, initialSettings }: StudioShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const supabase = createClient();
  const loadGraph = useProjectStore((s) => s.loadGraph);

  useEffect(() => {
    loadGraph(initialNodes, initialEdges, initialSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitleChange = async (title: string) => {
    await supabase.from("projects").update({ title }).eq("id", projectId);
  };

  return (
    <div className="flex h-screen flex-col bg-[#07070e] text-white">
      <StudioToolbar
        projectId={projectId}
        initialTitle={initialTitle}
        onTitleChange={handleTitleChange}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      <DirectorBar projectId={projectId} />

      <div className="flex flex-1 overflow-hidden">
        <StudioLeftPanel projectId={projectId} />

        <ReactFlowProvider>
          <main className="relative flex-1 overflow-hidden">
            <StudioCanvas projectId={projectId} />
          </main>
        </ReactFlowProvider>

        <NodeInspector projectId={projectId} />
      </div>

      <ProjectSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
