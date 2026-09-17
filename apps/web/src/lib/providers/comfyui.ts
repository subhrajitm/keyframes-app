import type { AIProvider, ImageGenerationRequest, VideoGenerationRequest, GenerationResult } from "./types";

/**
 * ComfyUI provider for local GPU inference.
 *
 * Setup:
 *   1. Run ComfyUI locally: python main.py --listen 0.0.0.0 --port 8188
 *   2. Set COMFYUI_BASE_URL=http://localhost:8188 in .env.local
 *   3. Load your workflow JSON via the ComfyUI UI and note the node IDs
 *   4. Implement generateImage/generateVideo below using the /prompt API
 *
 * Docs: https://github.com/comfyanonymous/ComfyUI
 */
export class ComfyUIProvider implements AIProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.COMFYUI_BASE_URL ?? "http://localhost:8188";
  }

  async generateImage(_req: ImageGenerationRequest): Promise<GenerationResult> {
    throw new Error(
      "ComfyUI image generation not yet implemented. " +
      "Set COMFYUI_BASE_URL and implement the /prompt workflow here."
    );
  }

  async generateVideo(_req: VideoGenerationRequest): Promise<GenerationResult> {
    throw new Error(
      "ComfyUI video generation not yet implemented. " +
      "Set COMFYUI_BASE_URL and implement the /prompt workflow (e.g. Wan 2.1) here."
    );
  }
}
