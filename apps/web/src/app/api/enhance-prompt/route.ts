import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const explabs = createOpenAI({
  baseURL: "https://api.experientiallabs.ai/v1",
  apiKey: process.env.EXPLABS_API_KEY ?? "",
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, mode = "shot" } = await req.json() as { prompt: string; mode?: "shot" | "director" };
  if (!prompt?.trim()) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const systemPrompt = mode === "director"
    ? `You are a film director's assistant. Rewrite the user's video concept into a rich, specific creative brief.
Include: visual style, mood, pacing, key scenes, and cinematic references.
Return only the enhanced brief — no explanations, no labels.`
    : `You are a cinematographer writing shot descriptions for an AI video generator.
Rewrite the input into a vivid, detailed cinematic shot description.
Include: camera angle, lens feel, lighting, subject action, mood, and color palette.
Keep it under 200 words. Return only the enhanced description — no explanations.`;

  const { text } = await generateText({
    model: explabs("gpt-5.6-luna"),
    system: systemPrompt,
    prompt: prompt.trim(),
  });

  return NextResponse.json({ enhanced: text.trim() });
}
