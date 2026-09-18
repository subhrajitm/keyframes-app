import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tasks } from "@trigger.dev/sdk/v3";
import type { ShotSpec } from "@keyframe/types";
import type { generateImageTask } from "@/trigger/generate-image";

const REGEN_CREDITS = 4; // 1 image + 3 video

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ shotId: string }> },
) {
  const { shotId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch shot + verify ownership via project
  const { data: shot } = await supabase
    .from("shots")
    .select("id, shot_spec, project_id, status")
    .eq("id", shotId)
    .single();

  if (!shot) return NextResponse.json({ error: "Shot not found" }, { status: 404 });

  const { data: project } = await supabase
    .from("projects")
    .select("id, graph_state")
    .eq("id", shot.project_id)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Atomic check-and-deduct — eliminates the manual check + update race condition
  const { data: deducted } = await supabase.rpc("deduct_credits", { amount: REGEN_CREDITS });
  if (!deducted) {
    return NextResponse.json(
      { error: `Insufficient credits (need ${REGEN_CREDITS})` },
      { status: 402 },
    );
  }

  // Extract asset refs from graph
  const graphState = project.graph_state as Record<string, unknown> | null;
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
  const styleRefUrl = settings?.["styleRefUrl"] as string | undefined;

  await supabase
    .from("shots")
    .update({ status: "image_pending", image_url: null, video_url: null, error: null })
    .eq("id", shotId);

  const base = shot.shot_spec as unknown as ShotSpec;
  const shotSpec: ShotSpec = {
    ...base,
    characterRefs: characterRefs.length ? characterRefs : (base.characterRefs ?? []),
    locationRef: locationRef ?? base.locationRef,
    ...(styleRefUrl ? { styleRefUrl } : {}),
  };

  try {
    const handle = await tasks.trigger<typeof generateImageTask>("generate-image", {
      shotId,
      shotSpec,
    });
    await supabase.from("shots").update({ trigger_run_id: handle.id }).eq("id", shotId);
    return NextResponse.json({ runId: handle.id });
  } catch {
    // Task enqueue failed — reset shot and refund
    await supabase
      .from("shots")
      .update({ status: "idle", updated_at: new Date().toISOString() })
      .eq("id", shotId);
    await createAdminClient().rpc("increment_credits", { uid: user.id, amount: REGEN_CREDITS });
    return NextResponse.json({ error: "Failed to enqueue generation task" }, { status: 500 });
  }
}
