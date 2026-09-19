export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export type ImageModel =
  | "fal/flux-pro"
  | "fal/flux-lora"
  | "fal/stable-diffusion-xl"
  | "comfyui/custom";

export type VideoModel =
  // Recommended default — best quality/price, 5 free gens/day
  | "fal/minimax-h3-max"
  // Premium — tops independent quality leaderboards, ~7x more expensive
  | "fal/seedance-2-5"
  // Legacy / fallback
  | "fal/kling-v3"
  | "fal/wan-3"
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
  /** URL of a visual style reference image applied to all shots */
  styleRefUrl?: string;

  style?: string;
  /** Shot duration in seconds */
  duration: number;
  fps: number;
  aspectRatio: AspectRatio;
  /** Output resolution — controls image pixel dimensions */
  outputResolution?: "720p" | "1080p";
  /** IP-adapter scale for character reference images (0.1–1.0) */
  characterStrength?: number;

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
