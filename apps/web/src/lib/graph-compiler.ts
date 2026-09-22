import type { KFNode, KFEdge, NodeData } from "@/store/project-store";
import type { DirectorOutput } from "@keyframe/types";

// Horizontal pipeline per shot, shots stacked top → bottom
// Each row:  [Char?] [Loc?]   [Prompt] → [ImageGen] → [VideoGen] → [Output]
const ROW_HEIGHT  = 340;   // vertical gap between shot rows
const PIPE_X      = [0, 400, 760, 1120] as const; // prompt, imageGen, videoGen, output
const AUX_X       = -360;  // character / location left of pipeline

interface CompileResult {
  nodes: KFNode[];
  edges: KFEdge[];
}

export function compileDirectorOutput(output: DirectorOutput): CompileResult {
  const nodes: KFNode[] = [];
  const edges: KFEdge[] = [];

  let globalShotIdx = 0;

  output.scenes.forEach((scene, sceneIdx) => {
    scene.shots.forEach((shot, shotIdx) => {
      const rowY   = globalShotIdx * ROW_HEIGHT;
      const hasChar = (shot.characterRefs?.length ?? 0) > 0;
      const hasLoc  = !!shot.locationRef;

      // Vertically centre aux nodes around the pipeline row
      const auxOffsets =
        hasChar && hasLoc ? [-140, 140]   // char above, loc below
        : [0];                            // single aux node centred

      const nodeId = (suffix: string) => `s${sceneIdx}_sh${shotIdx}_${suffix}`;

      const addNode = (
        id: string,
        type: KFNode["type"],
        data: NodeData,
        x: number,
        y: number,
      ) => nodes.push({ id, type, position: { x, y }, data });

      const addEdge = (
        source: string, sourceHandle: string,
        target: string, targetHandle: string,
      ) =>
        edges.push({
          id: `${source}-${sourceHandle}--${target}-${targetHandle}`,
          source, sourceHandle, target, targetHandle,
          animated: false,
          style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
        });

      const promptId = nodeId("prompt");
      const imgId    = nodeId("img");
      const vidId    = nodeId("vid");
      const outId    = nodeId("out");

      // ── Aux nodes ─────────────────────────────────────────────────
      let auxI = 0;
      if (hasChar) {
        const charId = nodeId("char");
        addNode(charId, "character", {
          label: "Character",
          characterName: `Character (${shot.title})`,
          characterImageUrl: shot.characterRefs[0],
        }, AUX_X, rowY + auxOffsets[auxI++]);
        addEdge(charId, "character-out", imgId, "character-in");
      }

      if (hasLoc) {
        const locId = nodeId("loc");
        addNode(locId, "location", {
          label: "Location",
          locationName: `Location (${shot.title})`,
          locationDescription: "",
        }, AUX_X, rowY + auxOffsets[auxI]);
        addEdge(locId, "location-out", imgId, "location-in");
      }

      // ── Pipeline ──────────────────────────────────────────────────
      addNode(promptId, "prompt", {
        label: "Prompt",
        promptText: shot.prompt,
      }, PIPE_X[0], rowY);

      addNode(imgId, "imageGen", {
        label: "Image Gen",
        generationStatus: "idle",
      }, PIPE_X[1], rowY);
      addEdge(promptId, "prompt-out", imgId, "prompt-in");

      addNode(vidId, "videoGen", {
        label: "Video Gen",
        generationStatus: "idle",
      }, PIPE_X[2], rowY);
      addEdge(imgId, "image-out", vidId, "image-in");

      addNode(outId, "output", {
        label: `Clip ${globalShotIdx + 1}`,
        clipOrder: globalShotIdx,
      }, PIPE_X[3], rowY);
      addEdge(vidId, "video-out", outId, "video-in");

      globalShotIdx++;
    });
  });

  return { nodes, edges };
}
