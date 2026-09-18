import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProjectSettings } from "@/store/project-store";
import type { Json } from "@keyframe/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, title, category, description, settings } = await req.json() as {
    projectId: string;
    title: string;
    category: string;
    description?: string;
    settings: ProjectSettings;
  };

  if (!title || !category) {
    return NextResponse.json({ error: "title and category required" }, { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, description")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Save template — graph_snapshot stores the Director input config
  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      title,
      description: description || title,
      category,
      is_featured: false,
      graph_snapshot: {
        description: description || title,
        style: settings.style || null,
        totalDuration: settings.totalDuration,
        numScenes: settings.numScenes,
        imageModel: settings.imageModel,
        videoModel: settings.videoModel,
        aspectRatio: settings.aspectRatio,
      } as unknown as Json,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ templateId: template.id });
}
