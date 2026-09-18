import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import os from "os";
import fs from "fs/promises";
import https from "https";
import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) Ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = require("fs").createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

async function concatVideos(inputPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = Ffmpeg();
    inputPaths.forEach((p) => cmd.input(p));
    cmd
      .on("error", reject)
      .on("end", () => resolve())
      .mergeToFile(outputPath, os.tmpdir());
  });
}

export const composeVideoTask = task({
  id: "compose-video",
  maxDuration: 1800,
  run: async (payload: { projectId: string }) => {
    const { projectId } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Mark project as generating
    await supabase
      .from("projects")
      .update({ status: "generating", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    // Fetch all completed shots in order
    const { data: scenes } = await supabase
      .from("scenes")
      .select("id, order_index")
      .eq("project_id", projectId)
      .order("order_index");

    if (!scenes?.length) throw new Error("No scenes found");

    const { data: shots } = await supabase
      .from("shots")
      .select("id, order_index, scene_id, video_url, status")
      .eq("project_id", projectId)
      .eq("status", "completed")
      .order("order_index");

    if (!shots?.length) throw new Error("No completed shots to compose");

    // Sort shots by scene order then shot order
    const sceneOrder = Object.fromEntries(scenes.map((s) => [s.id, s.order_index]));
    const sorted = [...shots].sort((a, b) => {
      const sceneDiff = (sceneOrder[a.scene_id] ?? 0) - (sceneOrder[b.scene_id] ?? 0);
      return sceneDiff !== 0 ? sceneDiff : a.order_index - b.order_index;
    });

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "kf-compose-"));

    try {
      // Download all video clips
      const localPaths: string[] = [];
      for (const shot of sorted) {
        if (!shot.video_url) continue;
        const dest = path.join(tmpDir, `${shot.id}.mp4`);
        await downloadFile(shot.video_url, dest);
        localPaths.push(dest);
      }

      if (!localPaths.length) throw new Error("No video files downloaded");

      // Concatenate
      const outputPath = path.join(tmpDir, "final.mp4");
      await concatVideos(localPaths, outputPath);

      // Upload to Supabase Storage
      const fileBuffer = await fs.readFile(outputPath);
      const storagePath = `projects/${projectId}/final.mp4`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, fileBuffer, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(storagePath);

      await supabase
        .from("projects")
        .update({
          status: "complete",
          thumbnail_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      return { projectId, videoUrl: publicUrl };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});
