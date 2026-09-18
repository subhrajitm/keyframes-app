import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@keyframe/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await req.json() as { templateId: string };
  if (!templateId) return NextResponse.json({ error: "templateId required" }, { status: 400 });

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  // Create project with template settings pre-loaded and an empty canvas.
  // The user plans shots explicitly via the DirectorBar in the studio.
  const snap = template.graph_snapshot as Record<string, unknown>;
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: template.title,
      description: (snap.description as string) ?? template.title,
      graph_state: {
        nodes: [],
        edges: [],
        settings: {
          style: snap.style ?? "",
          totalDuration: snap.totalDuration ?? 30,
          numScenes: snap.numScenes ?? 3,
          imageModel: snap.imageModel ?? "fal/flux-pro",
          videoModel: snap.videoModel ?? "fal/minimax-h3-max",
          aspectRatio: snap.aspectRatio ?? "16:9",
        },
      } as unknown as Json,
    })
    .select("id")
    .single();

  if (error || !project) {
    return NextResponse.json({ error: error?.message ?? "Failed to create project" }, { status: 500 });
  }

  return NextResponse.json({ projectId: project.id });
}
