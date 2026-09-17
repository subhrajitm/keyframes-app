export interface GenerationJob {
  jobId: string;
  nodeId: string;
  projectId: string;
  type: "image" | "video";
  status: "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
  progress?: number;
}

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  characterRefUrl?: string;
  locationRefUrl?: string;
  style?: string;
}

export interface VideoGenerationParams {
  prompt: string;
  imageUrl: string;
  duration?: number;
  fps?: number;
}

export interface GenerationEvent {
  type: "generation:progress" | "generation:complete" | "generation:failed";
  payload: GenerationJob;
}
