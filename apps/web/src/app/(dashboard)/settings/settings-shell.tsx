"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileForm } from "./profile-form";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { ApiKeysForm } from "./api-keys-form";
import { DangerZone } from "./danger-zone";

type Section = "profile" | "email" | "billing" | "apikeys" | "danger";

interface Props {
  email: string;
  isOAuthUser: boolean;
  profile: {
    full_name: string | null;
    credits: number;
    avatar_url: string | null;
    fal_api_key: string | null;
    openrouter_api_key: string | null;
  };
}

const NAV: { id: Section; icon: string; label: string; danger?: boolean }[] = [
  { id: "profile",  icon: "person",         label: "Profile" },
  { id: "email",    icon: "lock",            label: "Email & Password" },
  { id: "billing",  icon: "toll",            label: "Credits & Billing" },
  { id: "apikeys",  icon: "key",             label: "API Keys" },
  { id: "danger",   icon: "delete_forever",  label: "Danger Zone", danger: true },
];

export function SettingsShell({ email, isOAuthUser, profile }: Props) {
  const [active, setActive] = useState<Section>("profile");
  const current = NAV.find((n) => n.id === active)!;

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.06] px-3 py-8">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-2 px-3 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="material-symbols-rounded text-[18px]">arrow_back</span>
          Dashboard
        </Link>

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-white/20">
          Settings
        </p>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors ${
                active === item.id
                  ? item.danger
                    ? "bg-red-500/10 text-red-400"
                    : "bg-white/[0.07] text-white"
                  : item.danger
                    ? "text-red-400/50 hover:bg-red-500/[0.06] hover:text-red-400"
                    : "text-white/40 hover:bg-white/[0.05] hover:text-white/80"
              }`}
            >
              <span className="material-symbols-rounded text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-12 py-12 max-w-2xl">
        <h1 className="mb-10 text-2xl font-semibold">{current.label}</h1>

        {active === "profile" && (
          <ProfileForm
            initialName={profile.full_name ?? ""}
            email={email}
            initialAvatarUrl={profile.avatar_url ?? ""}
          />
        )}

        {active === "email" && (
          <div className="space-y-10">
            <EmailForm currentEmail={email} />
            {!isOAuthUser ? (
              <>
                <div className="border-t border-white/[0.07]" />
                <PasswordForm />
              </>
            ) : (
              <p className="text-sm text-white/30">
                You signed in with an OAuth provider — password management is handled there.
              </p>
            )}
          </div>
        )}

        {active === "billing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-8 py-7">
              <div>
                <p className="text-5xl font-semibold">{profile.credits}</p>
                <p className="mt-1.5 text-sm text-white/40">credits remaining</p>
              </div>
              <div className="text-right text-sm text-white/30 space-y-1">
                <p>1 credit per image</p>
                <p>5 credits per video clip</p>
              </div>
            </div>

            <button
              disabled
              className="w-full flex items-center justify-between rounded-2xl bg-white/[0.04] px-7 py-5 opacity-50 cursor-not-allowed"
            >
              <div className="text-left">
                <p className="text-base font-medium">Buy credits</p>
                <p className="mt-0.5 text-sm text-white/40">Top up your balance</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/40">
                Coming soon
              </span>
            </button>
          </div>
        )}

        {active === "apikeys" && (
          <ApiKeysForm
            initialFalKey={profile.fal_api_key ?? ""}
            initialOpenrouterKey={profile.openrouter_api_key ?? ""}
          />
        )}

        {active === "danger" && (
          <div className="rounded-2xl bg-red-500/[0.04] ring-1 ring-red-500/15 p-7">
            <DangerZone />
          </div>
        )}
      </main>
    </div>
  );
}
