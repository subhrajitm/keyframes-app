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
  characterStrength?: number;
  numVariations?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl: string;
  duration: number;
  fps: number;
  modelId: string;
  cameraMotion?: string;
}

export interface AudioGenerationRequest {
  text: string;
  type: "narration" | "ambient";
  voice?: string;
  durationSeconds?: number;
}

export interface GenerationResult {
  url: string;
  urls?: string[];
  metadata?: Record<string, unknown>;
}

export interface AIProvider {
  generateImage(req: ImageGenerationRequest): Promise<GenerationResult>;
  generateVideo(req: VideoGenerationRequest): Promise<GenerationResult>;
  generateAudio?(req: AudioGenerationRequest): Promise<GenerationResult>;
}
