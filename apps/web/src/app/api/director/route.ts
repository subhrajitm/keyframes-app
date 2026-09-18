import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { runDirector } from "@/lib/director";
import { compileDirectorOutput } from "@/lib/graph-compiler";
import type { DirectorInput, Json } from "@keyframe/types";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB — director inputs are text, no need for more

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Reject oversized bodies before parsing
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  // Rate limit: 5 director runs per hour per user (each triggers an OpenRouter call)
  const allowed = await checkRateLimit(supabase, "director", 5, 3600);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many director requests. Try again later." },
      { status: 429 },
    );
  }

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

  let directorOutput: Awaited<ReturnType<typeof runDirector>>;
  try {
    directorOutput = await runDirector(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Director failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Persist scenes + shots in a loop; track created scene IDs so we can roll back
  // if a mid-loop insert fails (Supabase JS doesn't expose transactions directly).
  const createdSceneIds: string[] = [];

  try {
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

      createdSceneIds.push(sceneRow.id);

      for (let shi = 0; shi < scene.shots.length; shi++) {
        const shot = scene.shots[shi];
        const { error: shotErr } = await supabase.from("shots").insert({
          scene_id: sceneRow.id,
          project_id: body.projectId,
          order_index: shi,
          title: shot.title,
          shot_spec: shot as unknown as Json,
          node_id: `s${si}_sh${shi}_img`,
          status: "idle",
        });

        if (shotErr) {
          throw new Error(`Failed to create shot: ${shotErr.message}`);
        }
      }
    }
  } catch (err) {
    // Rollback: delete any scenes we created — cascades to their shots
    if (createdSceneIds.length > 0) {
      await supabase.from("scenes").delete().in("id", createdSceneIds);
    }
    const message = err instanceof Error ? err.message : "Failed to save scenes";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Compile graph and save to project
  const { nodes, edges } = compileDirectorOutput(directorOutput);
  await supabase
    .from("projects")
    .update({ graph_state: { nodes, edges } as unknown as Json })
    .eq("id", body.projectId);

  return NextResponse.json({ scenes: directorOutput.scenes, graph: { nodes, edges } });
}
