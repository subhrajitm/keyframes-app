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
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl: string;
  duration: number;
  fps: number;
  modelId: string;
}

export interface GenerationResult {
  url: string;
  metadata?: Record<string, unknown>;
}

export interface AIProvider {
  generateImage(req: ImageGenerationRequest): Promise<GenerationResult>;
  generateVideo(req: VideoGenerationRequest): Promise<GenerationResult>;
}
