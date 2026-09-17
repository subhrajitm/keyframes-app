import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

interface StudioPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const title = project.title as string;
  const status = project.status as string;

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f] text-white">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm font-bold text-violet-400 hover:text-violet-300">
            Keyframe
          </a>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/70">{title}</span>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40 capitalize">
          {status}
        </span>
      </header>

      {/* Canvas placeholder — Phase 3 */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-3 text-4xl">🎬</div>
          <p className="text-sm text-white/40">Node canvas coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
}
