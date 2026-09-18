import type { KFNode, KFEdge, NodeData } from "@/store/project-store";
import type { DirectorOutput } from "@keyframe/types";

// Vertical pipeline layout: each shot is a column, nodes stack top → bottom
const SHOT_COL_WIDTH  = 280;   // horizontal gap between shot columns
const NODE_Y_SPACING  = 200;   // vertical gap between pipeline stages
const AUX_X_OFFSET    = -260;  // character/location sit to the left of the column

interface CompileResult {
  nodes: KFNode[];
  edges: KFEdge[];
}

/**
 * Converts Director output into a React Flow graph.
 *
 * Layout per shot (top → bottom column):
 *   [char?] [loc?]  ← aux nodes left of column
 *        Prompt
 *          ↓
 *       ImageGen
 *          ↓
 *       VideoGen
 *          ↓
 *        Output
 *
 * Shots expand left → right; scenes are contiguous groups of columns.
 */
export function compileDirectorOutput(output: DirectorOutput): CompileResult {
  const nodes: KFNode[] = [];
  const edges: KFEdge[] = [];

  let globalColIdx = 0;

  output.scenes.forEach((scene, sceneIdx) => {
    scene.shots.forEach((shot, shotIdx) => {
      const baseX = globalColIdx * SHOT_COL_WIDTH;

      const nodeId = (suffix: string) =>
        `s${sceneIdx}_sh${shotIdx}_${suffix}`;

      const addNode = (id: string, type: KFNode["type"], data: NodeData, x: number, y: number) => {
        nodes.push({ id, type, position: { x, y }, data });
      };

      const addEdge = (source: string, sourceHandle: string, target: string, targetHandle: string) => {
        edges.push({
          id: `${source}-${sourceHandle}--${target}-${targetHandle}`,
          source, sourceHandle, target, targetHandle,
          animated: false,
          style: { stroke: "#6d28d9", strokeWidth: 1.5 },
        });
      };

      const imgId  = nodeId("img");
      const vidId  = nodeId("vid");
      const outId  = nodeId("out");
      const promptId = nodeId("prompt");

      // ── Aux nodes (left of column) ─────────────────────────────
      let auxY = 0;

      if (shot.characterRefs?.length) {
        const charId = nodeId("char");
        addNode(charId, "character", {
          label: "Character",
          characterName: `Character (${shot.title})`,
          characterImageUrl: shot.characterRefs[0],
        }, baseX + AUX_X_OFFSET, auxY);
        edges.push({
          id: `${charId}--${imgId}-char`,
          source: charId, sourceHandle: "character-out",
          target: imgId,  targetHandle: "character-in",
          animated: false,
          style: { stroke: "#6d28d9", strokeWidth: 1.5 },
        });
        auxY += 180;
      }

      if (shot.locationRef) {
        const locId = nodeId("loc");
        addNode(locId, "location", {
          label: "Location",
          locationName: `Location (${shot.title})`,
          locationDescription: "",
        }, baseX + AUX_X_OFFSET, auxY);
        edges.push({
          id: `${locId}--${imgId}-loc`,
          source: locId, sourceHandle: "location-out",
          target: imgId,  targetHandle: "location-in",
          animated: false,
          style: { stroke: "#6d28d9", strokeWidth: 1.5 },
        });
      }

      // ── Vertical pipeline ──────────────────────────────────────
      // Row 0: Prompt
      addNode(promptId, "prompt", {
        label: "Prompt",
        promptText: shot.prompt,
      }, baseX, 0);

      // Row 1: ImageGen
      addNode(imgId, "imageGen", {
        label: "Image Gen",
        generationStatus: "idle",
        generationId: undefined,
      }, baseX, NODE_Y_SPACING);
      addEdge(promptId, "prompt-out", imgId, "prompt-in");

      // Row 2: VideoGen
      addNode(vidId, "videoGen", {
        label: "Video Gen",
        generationStatus: "idle",
        generationId: undefined,
      }, baseX, NODE_Y_SPACING * 2);
      addEdge(imgId, "image-out", vidId, "image-in");

      // Row 3: Output
      const globalShotIdx = output.scenes
        .slice(0, sceneIdx)
        .reduce((sum, s) => sum + s.shots.length, 0) + shotIdx;

      addNode(outId, "output", {
        label: `Output ${globalShotIdx + 1}`,
        clipOrder: globalShotIdx,
      }, baseX, NODE_Y_SPACING * 3);
      addEdge(vidId, "video-out", outId, "video-in");

      globalColIdx++;
    });
  });

  return { nodes, edges };
}
