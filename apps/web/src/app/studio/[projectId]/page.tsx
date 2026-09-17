import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import type { KFNode, KFEdge } from "@/store/project-store";
import type { Json } from "@keyframe/types";

interface StudioPageProps {
  params: Promise<{ projectId: string }>;
}

function parseGraph(graphState: Json | null): { nodes: KFNode[]; edges: KFEdge[] } {
  if (!graphState || typeof graphState !== "object" || Array.isArray(graphState)) {
    return { nodes: [], edges: [] };
  }
  const g = graphState as Record<string, Json>;
  return {
    nodes: Array.isArray(g["nodes"]) ? (g["nodes"] as unknown as KFNode[]) : [],
    edges: Array.isArray(g["edges"]) ? (g["edges"] as unknown as KFEdge[]) : [],
  };
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const { nodes, edges } = parseGraph(project.graph_state);

  return (
    <StudioShell
      projectId={project.id}
      initialTitle={project.title}
      initialNodes={nodes}
      initialEdges={edges}
    />
  );
}
