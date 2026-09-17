import type { Database } from "./database";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];

export type AssetType = Asset["type"];
export type ProjectStatus = Project["status"];
export type GenerationStatus = Generation["status"];
