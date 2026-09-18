import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fal } from "@fal-ai/client";
import type { Json } from "@keyframe/types";

fal.config({ credentials: process.env.FAL_API_KEY });

const STYLE_SUFFIXES: Record<string, string> = {
  cinematic:   "cinematic photography, dramatic lighting, film grain, anamorphic lens",
  realistic:   "photorealistic, natural lighting, high detail, 8k",
  fantasy:     "fantasy art, painterly, ethereal lighting, magical atmosphere",
  noir:        "film noir, black and white, dramatic shadows, high contrast",
  documentary: "documentary photography, candid, natural light, handheld feel",
  anime:       "anime background, studio ghibli style, detailed illustration",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, style, locationName, projectId } = await req.json() as {
    prompt: string;
    style?: string;
    locationName?: string;
    projectId?: string;
  };

  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const styleSuffix = STYLE_SUFFIXES[style ?? "cinematic"] ?? STYLE_SUFFIXES.cinematic;
  const fullPrompt = `${prompt}, wide angle panoramic view, establishing shot, ${styleSuffix}`;

  try {
    const result = await fal.run("fal-ai/flux-pro", {
      input: {
        prompt: fullPrompt,
        negative_prompt: "people, text, watermark, blurry, distorted",
        image_size: { width: 1920, height: 960 },
        num_images: 1,
        enable_safety_checker: true,
      },
    }) as { images?: Array<{ url: string }> };

    const url = result?.images?.[0]?.url;
    if (!url) throw new Error("No image returned");

    // Save as location asset
    await supabase.from("assets").insert({
      user_id: user.id,
      project_id: projectId ?? null,
      type: "location",
      name: locationName || prompt.slice(0, 60),
      url,
      metadata: { prompt, style, fullPrompt } as Json,
    });

    return NextResponse.json({ url, prompt: fullPrompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
