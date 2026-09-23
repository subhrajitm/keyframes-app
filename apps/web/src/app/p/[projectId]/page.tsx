import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function PublicProjectPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, thumbnail_url, is_public, updated_at")
    .eq("id", projectId)
    .eq("is_public", true)
    .single();

  if (!project) notFound();

  const isVideo = project.thumbnail_url?.endsWith(".mp4") || project.thumbnail_url?.includes("/videos/");

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-4 py-16 text-white">
      <div className="w-full max-w-3xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white">{project.title}</h1>
        {project.description && (
          <p className="mt-3 text-base text-white/50 leading-relaxed">{project.description}</p>
        )}

        {/* Media */}
        {project.thumbnail_url && (
          <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            {isVideo ? (
              <video
                src={project.thumbnail_url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
              />
            ) : (
              <img src={project.thumbnail_url} alt={project.title} className="w-full object-cover" />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
          <Link
            href="/gallery"
            className="text-sm text-white/30 transition-colors hover:text-white/60"
          >
            ← Browse gallery
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-white/30 transition-colors hover:text-white/60"
          >
            Made with
            <span className="font-semibold text-white/50">Keyframe</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
