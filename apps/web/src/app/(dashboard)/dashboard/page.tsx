import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LogOut, Coins, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { TemplateGallery } from "@/components/dashboard/template-gallery";
import { createProject, logout } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: projects }, { data: profile }, { data: templates }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("users")
      .select("full_name, credits")
      .eq("id", user.id)
      .single(),
    supabase
      .from("templates")
      .select("*")
      .order("is_featured", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-violet-400">Key</span>frame
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">
              <Coins className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-white/70">{profile?.credits ?? 0} credits</span>
            </div>

            <span className="text-sm text-white/50">
              {profile?.full_name ?? user.email}
            </span>

            <Button asChild variant="ghost" size="icon">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <form action={createProject}>
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </form>
        </div>

        {/* Template gallery */}
        {templates && templates.length > 0 && (
          <div className="mb-10">
            <TemplateGallery templates={templates} />
          </div>
        )}

        {!projects || projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
            <div className="mb-4 rounded-full bg-violet-500/10 p-4">
              <Plus className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="mt-1 text-sm text-white/40">
              Create your first AI film project to get started
            </p>
            <form action={createProject} className="mt-6">
              <Button type="submit">Create your first project</Button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
