import Anthropic from "@anthropic-ai/sdk";
import type { DirectorInput, DirectorOutput, DirectorScene, ShotSpec } from "@keyframe/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SHOT_PLAN_SCHEMA = {
  type: "object" as const,
  required: ["scenes"],
  properties: {
    scenes: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "description", "shots"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          shots: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "prompt", "duration", "fps", "aspectRatio", "imageModel", "videoModel", "characterRefs", "orderInScene"],
              properties: {
                title: { type: "string" },
                prompt: { type: "string", description: "Detailed visual description of the shot" },
                negativePrompt: { type: "string" },
                characterRefs: { type: "array", items: { type: "string" } },
                locationRef: { type: "string" },
                style: { type: "string" },
                duration: { type: "number", description: "Shot duration in seconds" },
                fps: { type: "number", enum: [24, 30] },
                aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
                imageModel: {
                  type: "string",
                  enum: ["fal/flux-pro", "fal/flux-lora", "fal/stable-diffusion-xl", "comfyui/custom"],
                },
                videoModel: {
                  type: "string",
                  enum: ["fal/kling-v1", "fal/kling-v1-5", "fal/minimax-video", "comfyui/wan"],
                },
                orderInScene: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};

function buildSystemPrompt(): string {
  return `You are an AI Film Director for a video generation platform.
Given a project description, you decompose it into a precise, production-ready shot plan.

Rules:
- Keep shot prompts detailed and cinematic — include camera angle, lighting, subject action, mood
- Prefer "fal/flux-pro" for high-quality photorealistic stills
- Use "fal/kling-v1-5" for video unless specified otherwise
- Default fps is 24, aspect ratio is 16:9
- Shots should be 3–6 seconds each
- Keep style consistent across scenes for visual coherence
- Use negative prompts to exclude common artifacts (blur, overexposed, watermark)`;
}

function buildUserPrompt(input: DirectorInput): string {
  const lines = [`Project description: "${input.description}"`];
  if (input.style) lines.push(`Visual style: ${input.style}`);
  if (input.totalDuration) lines.push(`Target total duration: ~${input.totalDuration} seconds`);
  if (input.numScenes) lines.push(`Number of scenes: ${input.numScenes}`);
  if (input.characterAssets?.length) {
    lines.push(`Characters: ${input.characterAssets.map((c) => `${c.name} (ref: ${c.url})`).join(", ")}`);
  }
  if (input.locationAssets?.length) {
    lines.push(`Locations: ${input.locationAssets.map((l) => `${l.name} (ref: ${l.url})`).join(", ")}`);
  }
  lines.push("\nCreate a complete shot plan.");
  return lines.join("\n");
}

export async function runDirector(input: DirectorInput): Promise<DirectorOutput> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    system: buildSystemPrompt(),
    tools: [
      {
        name: "create_shot_plan",
        description: "Create a structured shot plan for the video project",
        input_schema: SHOT_PLAN_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "create_shot_plan" },
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Director did not produce a shot plan");
  }

  const raw = toolUse.input as { scenes: Array<{ title: string; description: string; shots: ShotSpec[] }> };

  const scenes: DirectorScene[] = raw.scenes.map((scene) => ({
    title: scene.title,
    description: scene.description,
    shots: scene.shots.map((shot) => ({
      ...shot,
      projectId: input.projectId,
      characterRefs: shot.characterRefs ?? [],
    })),
  }));

  return { scenes };
}
