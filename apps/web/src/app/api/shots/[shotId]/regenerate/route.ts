import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { ShotSpec } from "@keyframe/types";
import type { generateImageTask } from "@/trigger/generate-image";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ shotId: string }> }
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

  // Check credits (1 image + 3 video)
  const { data: userData } = await supabase
    .from("users").select("credits").eq("id", user.id).single();
  const credits = userData?.credits ?? 0;
  if (credits < 4) {
    return NextResponse.json({ error: "Insufficient credits (need 4)" }, { status: 402 });
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

  // Reset shot to idle then trigger
  await supabase.from("shots")
    .update({ status: "image_pending", image_url: null, video_url: null, error: null })
    .eq("id", shotId);

  const base = shot.shot_spec as unknown as ShotSpec;
  const shotSpec: ShotSpec = {
    ...base,
    characterRefs: characterRefs.length ? characterRefs : base.characterRefs ?? [],
    locationRef: locationRef ?? base.locationRef,
    ...(styleRefUrl ? { styleRefUrl } : {}),
  };

  const handle = await tasks.trigger<typeof generateImageTask>("generate-image", {
    shotId,
    shotSpec,
  });

  await supabase.from("shots").update({ trigger_run_id: handle.id }).eq("id", shotId);
  await supabase.from("users").update({ credits: credits - 4 }).eq("id", user.id);

  return NextResponse.json({ runId: handle.id });
}
