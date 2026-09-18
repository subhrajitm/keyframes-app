import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

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
      .select("full_name, credits, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("templates")
      .select("*")
      .order("is_featured", { ascending: false })
      .limit(10),
  ]);

  return (
    <DashboardShell
      user={{
        email: user.email ?? "",
        name: profile?.full_name ?? null,
        credits: profile?.credits ?? 0,
        avatarUrl: profile?.avatar_url ?? null,
      }}
      projects={projects ?? []}
      templates={templates ?? []}
    />
  );
}
