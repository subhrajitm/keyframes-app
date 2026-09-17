import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import { getProvider } from "@/lib/providers";
import type { ShotSpec } from "@keyframe/types";

export const generateVideoTask = task({
  id: "generate-video",
  maxDuration: 600,
  run: async (payload: { shotId: string; imageUrl: string; shotSpec: ShotSpec }) => {
    const { shotId, imageUrl, shotSpec } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from("shots")
      .update({ status: "video_processing", updated_at: new Date().toISOString() })
      .eq("id", shotId);

    try {
      const provider = getProvider();

      const result = await provider.generateVideo({
        prompt: shotSpec.prompt,
        imageUrl,
        duration: shotSpec.duration,
        fps: shotSpec.fps,
        modelId: shotSpec.videoModel,
      });

      await supabase
        .from("shots")
        .update({
          video_url: result.url,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", shotId);

      return { shotId, videoUrl: result.url };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      await supabase
        .from("shots")
        .update({ status: "failed", error, updated_at: new Date().toISOString() })
        .eq("id", shotId);
      throw err;
    }
  },
});
