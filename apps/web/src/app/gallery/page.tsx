import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60s

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, thumbnail_url, updated_at")
    .eq("is_public", true)
    .eq("status", "complete")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gallery</h1>
            <p className="mt-1.5 text-sm text-white/40">AI films made with Keyframe</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-white/30 transition-colors hover:text-white/60"
          >
            ← Dashboard
          </Link>
        </div>

        {!projects?.length ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="material-symbols-rounded mb-4 text-[48px] text-white/[0.07]">movie</span>
            <p className="text-base text-white/30">No public projects yet</p>
            <p className="mt-1 text-sm text-white/20">Be the first to share your film</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {projects.map((p) => {
              const isVideo = p.thumbnail_url?.endsWith(".mp4") || p.thumbnail_url?.includes("/videos/");
              return (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-white/[0.07] bg-[#111111] transition-colors hover:border-white/20"
                >
                  <div className="relative aspect-video overflow-hidden bg-white/[0.025]">
                    {p.thumbnail_url && isVideo ? (
                      <video
                        src={p.thumbnail_url}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="material-symbols-rounded text-[32px] text-white/[0.06]">movie</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                      {p.title}
                    </p>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/30">{p.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
