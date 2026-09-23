import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ shotId: string }> }) {
  const { shotId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variationIndex } = await req.json() as { variationIndex: number };

  // Fetch shot and verify ownership via project
  const { data: shot } = await supabase
    .from("shots")
    .select("id, variation_urls, project_id")
    .eq("id", shotId)
    .single();

  if (!shot) return NextResponse.json({ error: "Shot not found" }, { status: 404 });

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", shot.project_id)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const urls: string[] = shot.variation_urls ?? [];
  if (variationIndex < 0 || variationIndex >= urls.length) {
    return NextResponse.json({ error: "Invalid variation index" }, { status: 400 });
  }

  const selectedUrl = urls[variationIndex];
  await supabase
    .from("shots")
    .update({ image_url: selectedUrl, updated_at: new Date().toISOString() })
    .eq("id", shotId);

  return NextResponse.json({ imageUrl: selectedUrl });
}
