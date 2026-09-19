import { fal } from "@fal-ai/client";
import type { AIProvider, ImageGenerationRequest, VideoGenerationRequest, GenerationResult } from "./types";

// Dimensions keyed by aspectRatio then resolution
const DIMS: Record<string, Record<"720p" | "1080p", { width: number; height: number }>> = {
  "16:9": { "720p": { width: 1280, height: 720  }, "1080p": { width: 1920, height: 1080 } },
  "9:16": { "720p": { width: 720,  height: 1280 }, "1080p": { width: 1080, height: 1920 } },
  "1:1":  { "720p": { width: 1024, height: 1024 }, "1080p": { width: 1440, height: 1440 } },
  "4:3":  { "720p": { width: 1024, height: 768  }, "1080p": { width: 1440, height: 1080 } },
  "3:4":  { "720p": { width: 768,  height: 1024 }, "1080p": { width: 1080, height: 1440 } },
};

const VIDEO_ENDPOINTS: Record<string, string> = {
  "fal/minimax-h3-max": "fal-ai/minimax/h3-max/image-to-video",
  "fal/seedance-2-5":   "fal-ai/bytedance/seedance-2.5/image-to-video",
  "fal/kling-v3":       "fal-ai/kling-video/v3/standard/image-to-video",
  "fal/wan-3":          "fal-ai/wan/v3/image-to-video",
};

function buildVideoInput(modelKey: string, req: VideoGenerationRequest): Record<string, unknown> {
  const base = { prompt: req.prompt, image_url: req.imageUrl };
  switch (modelKey) {
    case "fal/minimax-h3-max":
      return { ...base, duration: Math.min(req.duration, 10) as 5 | 10, resolution: "768p" };
    case "fal/seedance-2-5":
      return { ...base, duration: Math.max(4, Math.min(req.duration, 15)), resolution: "720p" };
    case "fal/kling-v3":
      return { ...base, duration: req.duration, aspect_ratio: "16:9" };
    default:
      return { ...base, duration: req.duration, aspect_ratio: "16:9" };
  }
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
      input["ip_adapter_scale"] = req.characterStrength ?? 0.6;
    }

    if (req.styleRefUrl) {
      input["style_image_url"] = req.styleRefUrl;
      input["style_image_strength"] = 0.5;
    }

    const result = await fal.run(modelId, { input }) as { images?: Array<{ url: string }> };
    const url = result?.images?.[0]?.url;
    if (!url) throw new Error("fal.ai returned no image URL");

    return { url, metadata: { model: req.modelId } };
  }

  async generateVideo(req: VideoGenerationRequest): Promise<GenerationResult> {
    const endpoint = VIDEO_ENDPOINTS[req.modelId] ?? req.modelId.replace("fal/", "fal-ai/");
    const input = buildVideoInput(req.modelId, req);

    const result = await fal.run(endpoint, { input }) as { video?: { url: string } };
    const url = result?.video?.url;
    if (!url) throw new Error("fal.ai returned no video URL");

    return { url, metadata: { model: req.modelId, endpoint } };
  }
}

// Export dimension lookup so Trigger tasks can use the correct resolution
export { DIMS };
