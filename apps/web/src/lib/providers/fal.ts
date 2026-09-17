import { fal } from "@fal-ai/client";
import type { AIProvider, ImageGenerationRequest, VideoGenerationRequest, GenerationResult } from "./types";

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 1024, height: 1024 },
};

function dimensionsFromSize(w: number, h: number) {
  const key = `${w}:${h}`;
  return ASPECT_DIMENSIONS[key] ?? { width: w, height: h };
}

export class FalProvider implements AIProvider {
  constructor() {
    fal.config({ credentials: process.env.FAL_API_KEY });
  }

  async generateImage(req: ImageGenerationRequest): Promise<GenerationResult> {
    const modelId = req.modelId.replace("fal/", "fal-ai/");

    const input: Record<string, unknown> = {
      prompt: req.prompt,
      negative_prompt: req.negativePrompt,
      image_size: { width: req.width, height: req.height },
      num_images: 1,
      enable_safety_checker: true,
    };

    if (req.characterRefUrls?.length) {
      input["ip_adapter_image_url"] = req.characterRefUrls[0];
      input["ip_adapter_scale"] = 0.6;
    }

    const result = await fal.run(modelId, { input }) as { images?: Array<{ url: string }> };
    const url = result?.images?.[0]?.url;
    if (!url) throw new Error("fal.ai returned no image URL");

    return { url, metadata: { model: req.modelId } };
  }

  async generateVideo(req: VideoGenerationRequest): Promise<GenerationResult> {
    const modelId = req.modelId.replace("fal/", "fal-ai/");

    const result = await fal.run(modelId, {
      input: {
        prompt: req.prompt,
        image_url: req.imageUrl,
        duration: req.duration,
        aspect_ratio: "16:9",
      },
    }) as { video?: { url: string } };

    const url = result?.video?.url;
    if (!url) throw new Error("fal.ai returned no video URL");

    return { url, metadata: { model: req.modelId } };
  }
}
