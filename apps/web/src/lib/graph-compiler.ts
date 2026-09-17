import type { KFNode, KFEdge, NodeData } from "@/store/project-store";
import type { DirectorOutput } from "@keyframe/types";

const SCENE_COL_WIDTH = 900;
const SHOT_ROW_HEIGHT = 400;
const NODE_X_SPACING = 220;

interface CompileResult {
  nodes: KFNode[];
  edges: KFEdge[];
}

/**
 * Converts a Director's structured output into a React Flow graph.
 *
 * Layout per shot (left → right):
 *   character? → imageGen → videoGen → output
 *   location?  ↗
 *   prompt     ↗
 */
export function compileDirectorOutput(output: DirectorOutput): CompileResult {
  const nodes: KFNode[] = [];
  const edges: KFEdge[] = [];

  let sceneX = 0;

  output.scenes.forEach((scene, sceneIdx) => {
    scene.shots.forEach((shot, shotIdx) => {
      const baseX = sceneX;
      const baseY = shotIdx * SHOT_ROW_HEIGHT;
      let colOffset = 0;

      const nodeId = (suffix: string) =>
        `s${sceneIdx}_sh${shotIdx}_${suffix}`;

      const addNode = (id: string, type: KFNode["type"], data: NodeData, x: number, y: number) => {
        nodes.push({ id, type, position: { x, y }, data });
      };

      const addEdge = (source: string, sourceHandle: string, target: string, targetHandle: string) => {
        edges.push({
          id: `${source}-${sourceHandle}--${target}-${targetHandle}`,
          source,
          sourceHandle,
          target,
          targetHandle,
          animated: false,
          style: { stroke: "#7c3aed40", strokeWidth: 1.5 },
        });
      };

      // Character node (if refs provided)
      if (shot.characterRefs?.length) {
        const charId = nodeId("char");
        addNode(charId, "character", {
          label: "Character",
          characterName: `Character (${shot.title})`,
          characterImageUrl: shot.characterRefs[0],
        }, baseX + colOffset, baseY);
        colOffset += NODE_X_SPACING;

        const imgId = nodeId("img");
        // edge added after imageGen node below
        edges.push({
          id: `${charId}--${imgId}-char`,
          source: charId,
          sourceHandle: "character-out",
          target: imgId,
          targetHandle: "character-in",
          animated: false,
          style: { stroke: "#a855f740", strokeWidth: 1.5 },
        });
      }

      // Location node (if ref provided)
      if (shot.locationRef) {
        const locId = nodeId("loc");
        addNode(locId, "location", {
          label: "Location",
          locationName: `Location (${shot.title})`,
          locationDescription: "",
        }, baseX + colOffset, baseY + 80);
        colOffset += NODE_X_SPACING;

        const imgId = nodeId("img");
        edges.push({
          id: `${locId}--${imgId}-loc`,
          source: locId,
          sourceHandle: "location-out",
          target: imgId,
          targetHandle: "location-in",
          animated: false,
          style: { stroke: "#22c55e40", strokeWidth: 1.5 },
        });
      }

      // Prompt node
      const promptId = nodeId("prompt");
      addNode(promptId, "prompt", {
        label: "Prompt",
        promptText: shot.prompt,
      }, baseX + colOffset, baseY + 160);

      // ImageGen node
      const imgId = nodeId("img");
      addNode(imgId, "imageGen", {
        label: "Image Gen",
        generationStatus: "idle",
        generationId: undefined,
      }, baseX + colOffset + NODE_X_SPACING, baseY + 60);

      addEdge(promptId, "prompt-out", imgId, "prompt-in");

      // VideoGen node
      const vidId = nodeId("vid");
      addNode(vidId, "videoGen", {
        label: "Video Gen",
        generationStatus: "idle",
        generationId: undefined,
      }, baseX + colOffset + NODE_X_SPACING * 2, baseY + 60);

      addEdge(imgId, "image-out", vidId, "image-in");

      // Output node
      const outId = nodeId("out");
      const globalShotIdx = output.scenes
        .slice(0, sceneIdx)
        .reduce((sum, s) => sum + s.shots.length, 0) + shotIdx;

      addNode(outId, "output", {
        label: `Output ${globalShotIdx + 1}`,
        clipOrder: globalShotIdx,
      }, baseX + colOffset + NODE_X_SPACING * 3, baseY + 60);

      addEdge(vidId, "video-out", outId, "video-in");
    });

    sceneX += SCENE_COL_WIDTH;
  });

  return { nodes, edges };
}
