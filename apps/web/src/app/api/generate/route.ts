import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { ShotSpec } from "@keyframe/types";
import type { generateImageTask } from "../../../../trigger/generate-image";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, shotIds } = await req.json() as { projectId: string; shotIds?: string[] };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Fetch shots to generate (all idle shots, or specified ones)
  let query = supabase
    .from("shots")
    .select("id, shot_spec")
    .eq("project_id", projectId)
    .eq("status", "idle");

  if (shotIds?.length) {
    query = query.in("id", shotIds);
  }

  const { data: shots } = await query;
  if (!shots?.length) {
    return NextResponse.json({ error: "No idle shots to generate" }, { status: 400 });
  }

  const runs: { shotId: string; runId: string }[] = [];

  for (const shot of shots) {
    const shotSpec = shot.shot_spec as unknown as ShotSpec;

    // Mark as pending before queuing
    await supabase
      .from("shots")
      .update({ status: "image_pending", updated_at: new Date().toISOString() })
      .eq("id", shot.id);

    const handle = await tasks.trigger<typeof generateImageTask>("generate-image", {
      shotId: shot.id,
      shotSpec,
    });

    // Store Trigger run ID for tracking
    await supabase
      .from("shots")
      .update({ trigger_run_id: handle.id })
      .eq("id", shot.id);

    runs.push({ shotId: shot.id, runId: handle.id });
  }

  // Update project status
  await supabase
    .from("projects")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return NextResponse.json({ runs });
}
