import type { ShotSpec, ImageModel, VideoModel } from "./shot-spec";

export interface DirectorInput {
  projectId: string;
  description: string;
  style?: string;
  /** Target total video duration in seconds */
  totalDuration?: number;
  numScenes?: number;
  characterAssets?: Array<{ name: string; url: string }>;
  locationAssets?: Array<{ name: string; url: string }>;
  /** Override models for all shots — from project settings */
  imageModel?: ImageModel;
  videoModel?: VideoModel;
}

export interface DirectorScene {
  title: string;
  description: string;
  shots: ShotSpec[];
}

export interface DirectorOutput {
  scenes: DirectorScene[];
}
