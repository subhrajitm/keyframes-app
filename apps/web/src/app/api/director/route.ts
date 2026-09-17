import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runDirector } from "@/lib/director";
import { compileDirectorOutput } from "@/lib/graph-compiler";
import type { DirectorInput, Json } from "@keyframe/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as DirectorInput;
  if (!body.projectId || !body.description) {
    return NextResponse.json({ error: "projectId and description are required" }, { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", body.projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  try {
    // Run AI Director
    const directorOutput = await runDirector(body);

    // Persist scenes + shots to DB
    for (let si = 0; si < directorOutput.scenes.length; si++) {
      const scene = directorOutput.scenes[si];

      const { data: sceneRow, error: sceneErr } = await supabase
        .from("scenes")
        .insert({
          project_id: body.projectId,
          order_index: si,
          title: scene.title,
          description: scene.description,
        })
        .select("id")
        .single();

      if (sceneErr || !sceneRow) {
        throw new Error(`Failed to create scene: ${sceneErr?.message}`);
      }

      for (let shi = 0; shi < scene.shots.length; shi++) {
        const shot = scene.shots[shi];
        await supabase.from("shots").insert({
          scene_id: sceneRow.id,
          project_id: body.projectId,
          order_index: shi,
          title: shot.title,
          shot_spec: shot as unknown as Json,
          status: "idle",
        });
      }
    }

    // Compile graph and save to project
    const { nodes, edges } = compileDirectorOutput(directorOutput);
    await supabase
      .from("projects")
      .update({ graph_state: { nodes, edges } as unknown as Json })
      .eq("id", body.projectId);

    return NextResponse.json({ scenes: directorOutput.scenes, graph: { nodes, edges } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Director failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
