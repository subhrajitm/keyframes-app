import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fal } = require("@fal-ai/client") as { fal: { config: (o: object) => void; run: (id: string, opts: object) => Promise<unknown> } };
import type { Json } from "@keyframe/types";

fal.config({ credentials: process.env.FAL_API_KEY });

const VIEWS = [
  { key: "front",   prompt: "full body portrait, front view, facing camera, neutral pose, plain white background, studio lighting, photorealistic" },
  { key: "side",    prompt: "full body portrait, side profile view, facing left, plain white background, studio lighting, photorealistic" },
  { key: "quarter", prompt: "full body portrait, three-quarter view, slight angle, plain white background, studio lighting, photorealistic" },
];

const NEGATIVE = "blurry, distorted face, multiple people, watermark, text, bad anatomy, deformed";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { refUrl, characterName, projectId } = await req.json() as {
    refUrl: string;
    characterName: string;
    projectId: string;
  };

  if (!refUrl) return NextResponse.json({ error: "refUrl required" }, { status: 400 });

  try {
    // Generate all 3 views in parallel using PuLID (face identity preservation)
    const results = await Promise.all(
      VIEWS.map(async (view) => {
        const result = await fal.run("fal-ai/pulid", {
          input: {
            face_image_url: refUrl,
            prompt: `${characterName ? characterName + ", " : ""}${view.prompt}`,
            negative_prompt: NEGATIVE,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }) as { images?: Array<{ url: string }> };

        const url = result?.images?.[0]?.url;
        if (!url) throw new Error(`No image returned for ${view.key} view`);
        return { key: view.key, url };
      })
    );

    const views = Object.fromEntries(results.map((r) => [r.key, r.url]));

    // Save each generated view as a character asset
    for (const { key, url } of results) {
      await supabase.from("assets").insert({
        user_id: user.id,
        project_id: projectId ?? null,
        type: "character",
        name: `${characterName || "Character"} — ${key} view`,
        url,
        metadata: { view: key, refUrl, characterName } as Json,
      });
    }

    return NextResponse.json({ views });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
