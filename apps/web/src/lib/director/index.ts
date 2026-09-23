import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { DirectorInput, DirectorOutput, DirectorScene, ImageModel, VideoModel } from "@keyframe/types";

const explabs = createOpenAI({
  baseURL: "https://api.experientiallabs.ai/v1",
  apiKey: process.env.EXPLABS_API_KEY ?? "",
});

const DIRECTOR_MODEL = "gpt-5.6-luna";

function makeShotSchema(imageModel: ImageModel, videoModel: VideoModel) {
  return z.object({
    title: z.string(),
    prompt: z.string().describe("Detailed cinematic description of the shot"),
    negativePrompt: z.string().nullable(),
    characterRefs: z.array(z.string()),
    locationRef: z.string().nullable(),
    style: z.string().nullable(),
    cameraMotion: z.enum(["static", "zoom-in", "zoom-out", "pan-left", "pan-right", "tilt-up", "tilt-down"]),
    duration: z.number().describe("Shot duration in seconds"),
    fps: z.union([z.literal(24), z.literal(30)]),
    aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
    imageModel: z.enum(["fal/flux-pro", "fal/flux-lora", "fal/stable-diffusion-xl", "comfyui/custom"]),
    videoModel: z.enum(["fal/minimax-h3-max", "fal/seedance-2-5", "fal/kling-v3", "fal/wan-3", "comfyui/wan"]),
    orderInScene: z.number(),
  });
}

function buildSystemPrompt(input: DirectorInput): string {
  const imgModel = input.imageModel ?? "fal/flux-pro";
  const vidModel = input.videoModel ?? "fal/minimax-h3-max";
  return `You are an AI Film Director for a video generation platform.
Given a project description, decompose it into a precise, production-ready shot plan.

Rules:
- Shot prompts must be detailed and cinematic: include camera angle, lighting, subject action, and mood
- Use "${imgModel}" for ALL imageModel fields in this project
- Use "${vidModel}" for ALL videoModel fields in this project
- Each shot should be 3–6 seconds. Always set fps to 24 and aspectRatio to "16:9" unless specified
- Keep visual style consistent across all scenes
- negativePrompt: exclude blur, overexposure, watermarks, and deformed anatomy (never null)
- characterRefs: empty array [] if no characters referenced
- locationRef: null if no location asset applies
- style: null if no style override
- cameraMotion: choose deliberately — "zoom-in" for reveals, "pan-left"/"pan-right" for following action, "tilt-up" for grandeur, "zoom-out" for endings, "static" for dialogue/close-ups`;
}

function buildUserPrompt(input: DirectorInput): string {
  const lines = [`Project: "${input.description}"`];
  if (input.style) lines.push(`Style: ${input.style}`);
  if (input.totalDuration) lines.push(`Target total duration: ~${input.totalDuration}s`);
  if (input.numScenes) lines.push(`Number of scenes: ${input.numScenes}`);
  if (input.characterAssets?.length) {
    lines.push(`Characters: ${input.characterAssets.map((c) => `${c.name} (${c.url})`).join(", ")}`);
  }
  if (input.locationAssets?.length) {
    lines.push(`Locations: ${input.locationAssets.map((l) => `${l.name} (${l.url})`).join(", ")}`);
  }
  lines.push("\nCreate a complete shot plan with scenes and shots.");
  return lines.join("\n");
}

export async function runDirector(input: DirectorInput): Promise<DirectorOutput> {
  const imageModel = input.imageModel ?? "fal/flux-pro";
  const videoModel = input.videoModel ?? "fal/minimax-h3-max";

  const DirectorOutputSchema = z.object({
    scenes: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        shots: z.array(makeShotSchema(imageModel, videoModel)),
      })
    ),
  });

  const { object } = await generateObject({
    model: explabs(DIRECTOR_MODEL),
    schema: DirectorOutputSchema,
    system: buildSystemPrompt(input),
    prompt: buildUserPrompt(input),
  });

  const scenes: DirectorScene[] = object.scenes.map((scene) => ({
    title: scene.title,
    description: scene.description,
    shots: scene.shots.map((shot) => ({
      ...shot,
      projectId: input.projectId,
      characterRefs: shot.characterRefs ?? [],
      negativePrompt: shot.negativePrompt ?? undefined,
      locationRef: shot.locationRef ?? undefined,
      style: shot.style ?? undefined,
      cameraMotion: shot.cameraMotion,
    })),
  }));

  return { scenes };
}
