export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  characterRefUrls?: string[];
  locationRefUrl?: string;
  styleRefUrl?: string;
  style?: string;
  modelId: string;
  /** IP-adapter scale for character reference (0.1–1.0) */
  characterStrength?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl: string;
  duration: number;
  fps: number;
  modelId: string;
  cameraMotion?: string;
}

export interface GenerationResult {
  url: string;
  metadata?: Record<string, unknown>;
}

export interface AIProvider {
  generateImage(req: ImageGenerationRequest): Promise<GenerationResult>;
  generateVideo(req: VideoGenerationRequest): Promise<GenerationResult>;
}
