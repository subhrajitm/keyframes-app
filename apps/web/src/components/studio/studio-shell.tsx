"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { StudioToolbar } from "./studio-toolbar";
import { DirectorBar } from "./director-bar";
import { StudioLeftPanel } from "./studio-left-panel";
import { StudioCanvas } from "./studio-canvas";
import { ProjectSettingsPanel } from "./project-settings-panel";
import { StudioTimeline } from "./studio-timeline";
import { SaveTemplateModal } from "./save-template-modal";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore, type KFNode, type KFEdge, type ProjectSettings } from "@/store/project-store";

interface StudioShellProps {
  projectId: string;
  initialTitle: string;
  initialNodes: KFNode[];
  initialEdges: KFEdge[];
  initialSettings?: Partial<ProjectSettings>;
  initialDescription?: string;
}

export function StudioShell({ projectId, initialTitle, initialNodes, initialEdges, initialSettings, initialDescription }: StudioShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
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
    <div className="flex h-screen flex-col bg-[#080808] text-white">
      <StudioToolbar
        projectId={projectId}
        initialTitle={initialTitle}
        onTitleChange={handleTitleChange}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSaveTemplate={() => setSaveTemplateOpen(true)}
      />

      <DirectorBar projectId={projectId} initialDescription={initialDescription} />

      <div className="flex flex-1 overflow-hidden">
        {panelOpen && <StudioLeftPanel projectId={projectId} />}

        <ReactFlowProvider>
          <main className="relative flex-1 overflow-hidden">
            <StudioCanvas
              projectId={projectId}
              panelOpen={panelOpen}
              onTogglePanel={() => setPanelOpen((o) => !o)}
              timelineOpen={timelineOpen}
              onToggleTimeline={() => setTimelineOpen((o) => !o)}
            />
          </main>
        </ReactFlowProvider>
      </div>

      {timelineOpen && <StudioTimeline projectId={projectId} />}

      <ProjectSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <SaveTemplateModal
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        projectId={projectId}
        projectTitle={initialTitle}
      />
    </div>
  );
}
