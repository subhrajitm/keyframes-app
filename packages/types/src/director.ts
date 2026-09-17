import type { ShotSpec } from "./shot-spec";

export interface DirectorInput {
  projectId: string;
  description: string;
  style?: string;
  /** Target total video duration in seconds */
  totalDuration?: number;
  numScenes?: number;
  characterAssets?: Array<{ name: string; url: string }>;
  locationAssets?: Array<{ name: string; url: string }>;
}

export interface DirectorScene {
  title: string;
  description: string;
  shots: ShotSpec[];
}

export interface DirectorOutput {
  scenes: DirectorScene[];
}
