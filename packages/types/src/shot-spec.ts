export type AspectRatio = "16:9" | "9:16" | "1:1";

export type ImageModel =
  | "fal/flux-pro"
  | "fal/flux-lora"
  | "fal/stable-diffusion-xl"
  | "comfyui/custom";

export type VideoModel =
  | "fal/kling-v1"
  | "fal/kling-v1-5"
  | "fal/minimax-video"
  | "comfyui/wan";

export interface ShotSpec {
  /** Populated after DB insert */
  shotId?: string;
  sceneId?: string;
  projectId: string;

  orderInScene: number;
  title: string;
  prompt: string;
  negativePrompt?: string;

  /** URLs of character reference images for IP-adapter style consistency */
  characterRefs: string[];
  /** URL of location reference image */
  locationRef?: string;

  style?: string;
  /** Shot duration in seconds */
  duration: number;
  fps: number;
  aspectRatio: AspectRatio;

  imageModel: ImageModel;
  videoModel: VideoModel;
}

export type ShotStatus =
  | "idle"
  | "image_pending"
  | "image_processing"
  | "video_pending"
  | "video_processing"
  | "completed"
  | "failed";
