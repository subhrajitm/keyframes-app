import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { tasks } from "@trigger.dev/sdk/v3";
import type { composeVideoTask } from "@/trigger/compose-video";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 5 compose calls per hour per user
  const allowed = await checkRateLimit(supabase, "compose", 5, 3600);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many compose requests. Try again later." },
      { status: 429 },
    );
  }

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
  const clipOrder  = settings?.["clipOrder"]  as string[] | undefined;
  const musicUrl   = settings?.["musicUrl"]   as string | undefined;
  const transition = settings?.["transition"] as "none" | "fade" | "dissolve" | undefined;
  const vfxEffect  = settings?.["vfxEffect"]  as string | undefined;

  const handle = await tasks.trigger<typeof composeVideoTask>("compose-video", {
    projectId,
    clipOrder,
    musicUrl,
    transition,
    vfxEffect,
  });

  return NextResponse.json({ runId: handle.id });
}
