import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { composeVideoTask } from "@/trigger/compose-video";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await req.json() as { projectId: string };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const { data: project } = await supabase
    .from("projects")
    .select("id, graph_state")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Extract clipOrder and musicUrl from project settings
  const graphState = project.graph_state as Record<string, unknown> | null;
  const settings = graphState?.["settings"] as Record<string, unknown> | undefined;
  const clipOrder = settings?.["clipOrder"] as string[] | undefined;
  const musicUrl = settings?.["musicUrl"] as string | undefined;

  const handle = await tasks.trigger<typeof composeVideoTask>("compose-video", {
    projectId,
    clipOrder,
    musicUrl,
  });

  return NextResponse.json({ runId: handle.id });
}
