import type { AIProvider } from "./types";
import { FalProvider } from "./fal";
import { ComfyUIProvider } from "./comfyui";

export type ProviderName = "fal" | "comfyui";

export function getProvider(name?: ProviderName): AIProvider {
  const resolved = name ?? (process.env.AI_PROVIDER as ProviderName | undefined) ?? "fal";
  switch (resolved) {
    case "fal":
      return new FalProvider();
    case "comfyui":
      return new ComfyUIProvider();
    default:
      return new FalProvider();
  }
}

export type { AIProvider, ImageGenerationRequest, VideoGenerationRequest, GenerationResult } from "./types";
