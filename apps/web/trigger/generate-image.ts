import { task, tasks } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import { getProvider } from "@/lib/providers";
import type { ShotSpec } from "@keyframe/types";
import type { generateVideoTask } from "./generate-video";

const aspectDimensions: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 1024, height: 1024 },
};

export const generateImageTask = task({
  id: "generate-image",
  maxDuration: 300,
  run: async (payload: { shotId: string; shotSpec: ShotSpec }) => {
    const { shotId, shotSpec } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Mark as processing
    await supabase
      .from("shots")
      .update({ status: "image_processing", updated_at: new Date().toISOString() })
      .eq("id", shotId);

    try {
      const provider = getProvider();
      const dims = aspectDimensions[shotSpec.aspectRatio] ?? { width: 1280, height: 720 };

      const result = await provider.generateImage({
        prompt: shotSpec.prompt,
        negativePrompt: shotSpec.negativePrompt,
        width: dims.width,
        height: dims.height,
        characterRefUrls: shotSpec.characterRefs,
        locationRefUrl: shotSpec.locationRef,
        style: shotSpec.style,
        modelId: shotSpec.imageModel,
      });

      // Store image and advance to video_pending
      await supabase
        .from("shots")
        .update({
          image_url: result.url,
          status: "video_pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", shotId);

      // Chain into video generation
      await tasks.trigger<typeof generateVideoTask>("generate-video", {
        shotId,
        imageUrl: result.url,
        shotSpec,
      });

      return { shotId, imageUrl: result.url };
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
