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

async function concatWithFade(inputPaths: string[], outputPath: string, dissolve: boolean): Promise<void> {
  // Build a filter_complex that fades each clip in/out (fade) or cross-dissolves (dissolve)
  // For simplicity we apply fade-in (0.4s) and fade-out (0.4s) to each clip then hard-concat.
  // True dissolve (xfade) requires per-clip duration probing which is complex; we approximate it
  // with sequential fade-out / fade-in which gives a smooth "dip to black" effect.
  const fadeDur = dissolve ? 0.3 : 0.5;
  const tmpDir = path.dirname(outputPath);
  const processed: string[] = [];

  for (let i = 0; i < inputPaths.length; i++) {
    const dest = path.join(tmpDir, `faded_${i}.mp4`);
    await new Promise<void>((resolve, reject) => {
      Ffmpeg(inputPaths[i])
        .videoFilters([
          `fade=t=in:st=0:d=${fadeDur}`,
          `fade=t=out:st=999:d=${fadeDur}`,  // ffmpeg calculates actual end time
        ])
        .outputOptions(["-c:a copy"])
        .output(dest)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });
    processed.push(dest);
  }

  // Now hard-concat the faded clips
  await new Promise<void>((resolve, reject) => {
    const cmd = Ffmpeg();
    processed.forEach((p) => cmd.input(p));
    cmd
      .on("error", reject)
      .on("end", () => resolve())
      .mergeToFile(outputPath, tmpDir);
  });
}

async function mixAudio(videoPath: string, audioUrl: string, outputPath: string, tmpDir: string): Promise<void> {
  const audioPath = path.join(tmpDir, "music.mp3");
  await downloadFile(audioUrl, audioPath);

  return new Promise((resolve, reject) => {
    Ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        "-c:v copy",
        "-c:a aac",
        "-map 0:v:0",
        "-map 1:a:0",
        "-shortest",
      ])
      .output(outputPath)
      .on("error", reject)
      .on("end", () => resolve())
      .run();
  });
}

export const composeVideoTask = task({
  id: "compose-video",
  maxDuration: 1800,
  run: async (payload: { projectId: string; clipOrder?: string[]; musicUrl?: string; transition?: "none" | "fade" | "dissolve" }) => {
    const { projectId, clipOrder, musicUrl, transition = "none" } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from("projects")
      .update({ status: "generating", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    // Fetch all completed shots
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
      .eq("status", "completed");

    if (!shots?.length) throw new Error("No completed shots to compose");

    // Apply custom clip order or fall back to scene/shot order
    let sorted;
    if (clipOrder?.length) {
      const shotMap = Object.fromEntries(shots.map((s) => [s.id, s]));
      sorted = clipOrder
        .map((id) => shotMap[id])
        .filter(Boolean)
        .concat(shots.filter((s) => !clipOrder.includes(s.id)));
    } else {
      const sceneOrder = Object.fromEntries(scenes.map((s) => [s.id, s.order_index]));
      sorted = [...shots].sort((a, b) => {
        const diff = (sceneOrder[a.scene_id] ?? 0) - (sceneOrder[b.scene_id] ?? 0);
        return diff !== 0 ? diff : a.order_index - b.order_index;
      });
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "kf-compose-"));

    try {
      // Download all clips
      const localPaths: string[] = [];
      for (const shot of sorted) {
        if (!shot.video_url) continue;
        const dest = path.join(tmpDir, `${shot.id}.mp4`);
        await downloadFile(shot.video_url, dest);
        localPaths.push(dest);
      }

      if (!localPaths.length) throw new Error("No video files downloaded");

      // Concatenate clips (with optional transitions)
      const concatPath = path.join(tmpDir, "concat.mp4");
      if (transition === "none") {
        await concatVideos(localPaths, concatPath);
      } else {
        await concatWithFade(localPaths, concatPath, transition === "dissolve");
      }

      // Mix in background music if provided
      const finalLocalPath = musicUrl
        ? path.join(tmpDir, "final.mp4")
        : concatPath;

      if (musicUrl) {
        await mixAudio(concatPath, musicUrl, finalLocalPath, tmpDir);
      }

      // Upload to Supabase Storage
      const fileBuffer = await fs.readFile(finalLocalPath);
      const storagePath = `projects/${projectId}/final.mp4`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, fileBuffer, { contentType: "video/mp4", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(storagePath);

      await supabase
        .from("projects")
        .update({ status: "complete", thumbnail_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", projectId);

      return { projectId, videoUrl: publicUrl, clipCount: localPaths.length, hasMusicTrack: !!musicUrl };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});
