import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { tasks } from "@trigger.dev/sdk/v3";
import type { ShotSpec, Json } from "@keyframe/types";
import type { generateImageTask } from "@/trigger/generate-image";

const IMAGE_CREDITS = 1;
const VIDEO_CREDITS = 3;
const CREDITS_PER_SHOT = IMAGE_CREDITS + VIDEO_CREDITS;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 calls per 60 s (also naturally bounded by credit balance)
  const allowed = await checkRateLimit(supabase, "generate", 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Wait before generating again." }, { status: 429 });
  }

  const { projectId, shotIds } = await req.json() as { projectId: string; shotIds?: string[] };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const { data: project } = await supabase
    .from("projects")
    .select("id, graph_state")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Count idle shots upfront to compute credits needed
  let countQuery = supabase
    .from("shots")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("status", "idle");
  if (shotIds?.length) countQuery = countQuery.in("id", shotIds);
  const { count: shotCount } = await countQuery;

  if (!shotCount) return NextResponse.json({ error: "No idle shots to generate" }, { status: 400 });

  const creditsNeeded = shotCount * CREDITS_PER_SHOT;

  // Atomic check-and-deduct: eliminates the race condition where two concurrent
  // requests both pass a manual credit check then both deduct.
  const { data: deducted } = await supabase.rpc("deduct_credits", { amount: creditsNeeded });
  if (!deducted) {
    return NextResponse.json(
      { error: `Insufficient credits. Need ${creditsNeeded}.` },
      { status: 402 },
    );
  }

  // Extract character/location refs from graph nodes
  const graphState = project.graph_state as Record<string, Json> | null;
  const nodes = Array.isArray(graphState?.["nodes"])
    ? (graphState!["nodes"] as Array<Record<string, unknown>>)
    : [];
  const characterRefs = nodes
    .filter((n) => n["type"] === "character")
    .map((n) => (n["data"] as Record<string, unknown>)?.["characterImageUrl"] as string)
    .filter(Boolean);
  const locationRef = nodes
    .filter((n) => n["type"] === "location")
    .map((n) => (n["data"] as Record<string, unknown>)?.["locationImageUrl"] as string)
    .find(Boolean);
  const settings = graphState?.["settings"] as Record<string, unknown> | undefined;
  const styleRefUrl        = settings?.["styleRefUrl"]        as string | undefined;
  const negativePrompt     = settings?.["negativePrompt"]     as string | undefined;
  const characterStrength  = settings?.["characterStrength"]  as number | undefined;
  const outputResolution   = settings?.["outputResolution"]   as "720p" | "1080p" | undefined;
  const shotDuration       = settings?.["shotDuration"]       as number | undefined;
  const fps                = settings?.["fps"]                as 24 | 30 | undefined;
  const cameraMotion       = settings?.["cameraMotion"]       as ShotSpec["cameraMotion"] | undefined;
  const numVariations      = settings?.["numVariations"]      as number | undefined;

  // Fetch idle shots
  let query = supabase
    .from("shots")
    .select("id, shot_spec")
    .eq("project_id", projectId)
    .eq("status", "idle");
  if (shotIds?.length) query = query.in("id", shotIds);
  const { data: shots } = await query;

  if (!shots?.length) {
    // Shots disappeared between count and fetch — full refund
    await createAdminClient().rpc("increment_credits", { uid: user.id, amount: creditsNeeded });
    return NextResponse.json({ error: "No idle shots to generate" }, { status: 400 });
  }

  const runs: { shotId: string; runId: string }[] = [];
  let triggeredCount = 0;

  for (const shot of shots) {
    const base = shot.shot_spec as unknown as ShotSpec;
    const shotSpec: ShotSpec = {
      ...base,
      characterRefs: characterRefs.length ? characterRefs : (base.characterRefs ?? []),
      locationRef: locationRef ?? base.locationRef,
      ...(styleRefUrl       ? { styleRefUrl }       : {}),
      ...(negativePrompt    ? { negativePrompt }     : {}),
      ...(characterStrength ? { characterStrength }  : {}),
      ...(outputResolution  ? { outputResolution }   : {}),
      ...(shotDuration      ? { duration: shotDuration } : {}),
      ...(fps               ? { fps }                : {}),
      ...(cameraMotion      ? { cameraMotion }        : {}),
      ...(numVariations     ? { numVariations }       : {}),
    };

    await supabase
      .from("shots")
      .update({ status: "image_pending", updated_at: new Date().toISOString() })
      .eq("id", shot.id);

    try {
      const handle = await tasks.trigger<typeof generateImageTask>("generate-image", {
        shotId: shot.id,
        shotSpec,
      });
      await supabase.from("shots").update({ trigger_run_id: handle.id }).eq("id", shot.id);
      runs.push({ shotId: shot.id, runId: handle.id });
      triggeredCount++;
    } catch {
      // Task enqueue failed — reset this shot and refund its credits later
      await supabase
        .from("shots")
        .update({ status: "idle", updated_at: new Date().toISOString() })
        .eq("id", shot.id);
    }
  }

  // Refund credits for shots whose task enqueue failed
  const untriggered = shots.length - triggeredCount;
  if (untriggered > 0) {
    await createAdminClient().rpc("increment_credits", {
      uid: user.id,
      amount: untriggered * CREDITS_PER_SHOT,
    });
  }

  if (runs.length === 0) {
    return NextResponse.json({ error: "Failed to trigger any generation tasks" }, { status: 500 });
  }

  await supabase
    .from("projects")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return NextResponse.json({ runs, creditsDeducted: triggeredCount * CREDITS_PER_SHOT });
}
