import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "./profile-form";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { ApiKeysForm } from "./api-keys-form";
import { DangerZone } from "./danger-zone";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, credits, avatar_url, fal_api_key, openrouter_api_key")
    .eq("id", user.id)
    .single();

  const isOAuthUser = user.app_metadata?.provider !== "email";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Top nav */}
      <header className="px-8 pt-8 pb-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="material-symbols-rounded text-[18px]">arrow_back</span>
          Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-8 py-10 space-y-16">

        {/* Page title */}
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

        {/* ── Profile ─────────────────────────────────────────────── */}
        <Section title="Profile" icon="person">
          <ProfileForm
            initialName={profile?.full_name ?? ""}
            email={user.email ?? ""}
            initialAvatarUrl={profile?.avatar_url ?? ""}
          />
        </Section>

        {/* ── Email & Password ────────────────────────────────────── */}
        <Section title="Email & Password" icon="lock">
          <div className="space-y-10">
            <EmailForm currentEmail={user.email ?? ""} />

            {!isOAuthUser ? (
              <>
                <div className="border-t border-white/[0.07]" />
                <PasswordForm />
              </>
            ) : (
              <p className="text-sm text-white/30">
                You signed in with {user.app_metadata?.provider} — password management is handled there.
              </p>
            )}
          </div>
        </Section>

        {/* ── Credits & Billing ───────────────────────────────────── */}
        <Section title="Credits & Billing" icon="toll">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-semibold">{profile?.credits ?? 0}</p>
                <p className="mt-1 text-sm text-white/40">credits remaining</p>
              </div>
              <div className="text-right text-sm text-white/30 space-y-0.5">
                <p>1 credit per image</p>
                <p>5 credits per video clip</p>
              </div>
            </div>

            <button
              disabled
              className="w-full flex items-center justify-between rounded-xl bg-white/5 px-5 py-4 opacity-50 cursor-not-allowed"
            >
              <span className="text-base font-medium">Buy credits</span>
              <span className="text-sm text-white/40">Coming soon</span>
            </button>
          </div>
        </Section>

        {/* ── API Keys ────────────────────────────────────────────── */}
        <Section title="API Keys" icon="key">
          <ApiKeysForm
            initialFalKey={profile?.fal_api_key ?? ""}
            initialOpenrouterKey={profile?.openrouter_api_key ?? ""}
          />
        </Section>

        {/* ── Danger Zone ─────────────────────────────────────────── */}
        <Section title="Danger Zone" icon="delete_forever" danger>
          <DangerZone />
        </Section>

      </main>
    </div>
  );
}

function Section({
  title,
  icon,
  danger = false,
  children,
}: {
  title: string;
  icon: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className={`flex items-center gap-3 ${danger ? "text-red-400/70" : "text-white/50"}`}>
        <span className="material-symbols-rounded text-[22px]">{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className={`rounded-2xl p-7 space-y-6 ${danger ? "bg-red-500/[0.04] ring-1 ring-red-500/15" : "bg-white/[0.04]"}`}>
        {children}
      </div>
    </section>
  );
}
