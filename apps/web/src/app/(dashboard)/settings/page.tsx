import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins, CreditCard, User, Lock, Key, Trash2 } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { ApiKeysForm } from "./api-keys-form";
import { DangerZone } from "./danger-zone";
import { Button } from "@/components/ui/button";

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
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm font-medium">Settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">

        {/* ── Profile ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<User className="h-4 w-4" />} label="Profile" />
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <ProfileForm
              initialName={profile?.full_name ?? ""}
              email={user.email ?? ""}
              initialAvatarUrl={profile?.avatar_url ?? ""}
            />
          </div>
        </section>

        {/* ── Email & Password ──────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Lock className="h-4 w-4" />} label="Email & Password" />
          <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/[0.06]">
            <div className="p-6">
              <h3 className="mb-4 text-xs font-medium text-white/50">Email address</h3>
              <EmailForm currentEmail={user.email ?? ""} />
            </div>

            {!isOAuthUser && (
              <div className="p-6">
                <h3 className="mb-4 text-xs font-medium text-white/50">Change password</h3>
                <PasswordForm />
              </div>
            )}

            {isOAuthUser && (
              <div className="p-6">
                <p className="text-xs text-white/30">
                  Your account uses {user.app_metadata?.provider} for sign-in — password management is handled there.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Credits & Billing ─────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<CreditCard className="h-4 w-4" />} label="Credits & Billing" />
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                <Coins className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{profile?.credits ?? 0} credits</p>
                <p className="text-xs text-white/40">Each image costs 1 credit · each video clip costs 5 credits</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-medium">Buy more credits</p>
                <p className="text-xs text-white/40">Top up your balance to keep generating</p>
              </div>
              <Button size="sm" disabled className="gap-1.5 opacity-60">
                Coming soon
              </Button>
            </div>
          </div>
        </section>

        {/* ── API Keys ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Key className="h-4 w-4" />} label="API Keys" />
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <ApiKeysForm
              initialFalKey={profile?.fal_api_key ?? ""}
              initialOpenrouterKey={profile?.openrouter_api_key ?? ""}
            />
          </div>
        </section>

        {/* ── Danger Zone ───────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Trash2 className="h-4 w-4 text-red-500/60" />} label="Danger Zone" danger />
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <DangerZone />
          </div>
        </section>

      </main>
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className={`mb-4 flex items-center gap-2 ${danger ? "text-red-500/60" : "text-white/40"}`}>
      {icon}
      <h2 className="text-sm font-semibold uppercase tracking-widest">{label}</h2>
    </div>
  );
}
