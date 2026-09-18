import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runDirector } from "@/lib/director";
import { compileDirectorOutput } from "@/lib/graph-compiler";
import type { DirectorInput, Json, ImageModel, VideoModel } from "@keyframe/types";

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

  // Create a new project
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .insert({ user_id: user.id, title: template.title })
    .select("id")
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: projErr?.message ?? "Failed to create project" }, { status: 500 });
  }

  // Extract template settings
  const snap = template.graph_snapshot as Record<string, unknown>;
  const directorInput: DirectorInput = {
    projectId: project.id,
    description: (snap.description as string) ?? template.title,
    style: snap.style as string | undefined,
    totalDuration: snap.totalDuration as number | undefined,
    numScenes: snap.numScenes as number | undefined,
    imageModel: snap.imageModel as ImageModel | undefined,
    videoModel: snap.videoModel as VideoModel | undefined,
  };

  try {
    const directorOutput = await runDirector(directorInput);

    // Persist scenes + shots
    for (let si = 0; si < directorOutput.scenes.length; si++) {
      const scene = directorOutput.scenes[si];
      const { data: sceneRow } = await supabase
        .from("scenes")
        .insert({ project_id: project.id, order_index: si, title: scene.title, description: scene.description })
        .select("id")
        .single();

      if (!sceneRow) continue;

      for (let shi = 0; shi < scene.shots.length; shi++) {
        const shot = scene.shots[shi];
        await supabase.from("shots").insert({
          scene_id: sceneRow.id,
          project_id: project.id,
          order_index: shi,
          title: shot.title,
          shot_spec: shot as unknown as Json,
          node_id: `s${si}_sh${shi}_img`,
          status: "idle",
        });
      }
    }

    const { nodes, edges } = compileDirectorOutput(directorOutput);
    await supabase
      .from("projects")
      .update({ graph_state: { nodes, edges, settings: { ...snap } } as unknown as Json })
      .eq("id", project.id);

    return NextResponse.json({ projectId: project.id });
  } catch (err) {
    // Clean up project on Director failure
    await supabase.from("projects").delete().eq("id", project.id);
    const message = err instanceof Error ? err.message : "Director failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
