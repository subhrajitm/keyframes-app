import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsShell } from "./settings-shell";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, credits, avatar_url, fal_api_key, explabs_api_key")
    .eq("id", user.id)
    .single();

  return (
    <SettingsShell
      email={user.email ?? ""}
      isOAuthUser={user.app_metadata?.provider !== "email"}
      profile={{
        full_name: profile?.full_name ?? null,
        credits: profile?.credits ?? 0,
        avatar_url: profile?.avatar_url ?? null,
        fal_api_key: profile?.fal_api_key ?? null,
        explabs_api_key: profile?.explabs_api_key ?? null,
      }}
    />
  );
}
