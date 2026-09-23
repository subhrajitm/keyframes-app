import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, type, voice, durationSeconds } = await req.json() as {
    text: string;
    type: "narration" | "ambient";
    voice?: string;
    durationSeconds?: number;
  };

  if (!text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "type is required" }, { status: 400 });

  const provider = getProvider();
  if (!provider.generateAudio) {
    return NextResponse.json({ error: "Audio generation not supported by current provider" }, { status: 501 });
  }

  try {
    const result = await provider.generateAudio({ text: text.trim(), type, voice, durationSeconds });
    return NextResponse.json({ audioUrl: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audio generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
