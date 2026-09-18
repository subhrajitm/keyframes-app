import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { ShotSpec, Json } from "@keyframe/types";
import type { generateImageTask } from "@/trigger/generate-image";

const IMAGE_CREDITS = 1;
const VIDEO_CREDITS = 3;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, shotIds } = await req.json() as { projectId: string; shotIds?: string[] };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const { data: project } = await supabase
    .from("projects")
    .select("id, graph_state")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Check credit balance
  const { data: userData } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single();

  const credits = userData?.credits ?? 0;

  // Count idle shots first to check credits upfront
  let countQuery = supabase.from("shots").select("id", { count: "exact", head: true })
    .eq("project_id", projectId).eq("status", "idle");
  if (shotIds?.length) countQuery = countQuery.in("id", shotIds);
  const { count: shotCount } = await countQuery;

  const creditsNeeded = (shotCount ?? 0) * (IMAGE_CREDITS + VIDEO_CREDITS);
  if (credits < creditsNeeded) {
    return NextResponse.json(
      { error: `Insufficient credits. Need ${creditsNeeded}, have ${credits}.` },
      { status: 402 }
    );
  }

  // Extract character/location refs from graph nodes
  const graphState = project.graph_state as Record<string, Json> | null;
  const nodes = Array.isArray(graphState?.["nodes"]) ? graphState!["nodes"] as Array<Record<string, unknown>> : [];
  const characterRefs = nodes
    .filter((n) => n["type"] === "character")
    .map((n) => (n["data"] as Record<string, unknown>)?.["characterImageUrl"] as string)
    .filter(Boolean);
  const locationRef = nodes
    .filter((n) => n["type"] === "location")
    .map((n) => (n["data"] as Record<string, unknown>)?.["locationImageUrl"] as string)
    .find(Boolean);
  const settings = graphState?.["settings"] as Record<string, unknown> | undefined;
  const styleRefUrl = settings?.["styleRefUrl"] as string | undefined;

  // Fetch idle shots
  let query = supabase.from("shots").select("id, shot_spec")
    .eq("project_id", projectId).eq("status", "idle");
  if (shotIds?.length) query = query.in("id", shotIds);

  const { data: shots } = await query;
  if (!shots?.length) return NextResponse.json({ error: "No idle shots to generate" }, { status: 400 });

  const runs: { shotId: string; runId: string }[] = [];

  for (const shot of shots) {
    const base = shot.shot_spec as unknown as ShotSpec;
    const shotSpec: ShotSpec = {
      ...base,
      characterRefs: characterRefs.length ? characterRefs : base.characterRefs ?? [],
      locationRef: locationRef ?? base.locationRef,
      // Style reference from project settings
      ...(styleRefUrl ? { styleRefUrl } : {}),
    };

    await supabase.from("shots")
      .update({ status: "image_pending", updated_at: new Date().toISOString() })
      .eq("id", shot.id);

    const handle = await tasks.trigger<typeof generateImageTask>("generate-image", {
      shotId: shot.id,
      shotSpec,
    });

    await supabase.from("shots")
      .update({ trigger_run_id: handle.id })
      .eq("id", shot.id);

    runs.push({ shotId: shot.id, runId: handle.id });
  }

  // Deduct credits upfront (refunded if task fails)
  await supabase.from("users")
    .update({ credits: credits - creditsNeeded })
    .eq("id", user.id);

  await supabase.from("projects")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return NextResponse.json({ runs, creditsDeducted: creditsNeeded });
}
