"use client";

import Link from "next/link";
import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { logout } from "@/app/actions";

export interface AppTopbarUser {
  email: string;
  name: string | null;
  credits: number;
  avatarUrl: string | null;
}

interface AppTopbarProps {
  user?: AppTopbarUser | null;
}

function Avatar({ user, size = "sm" }: { user: AppTopbarUser; size?: "sm" | "lg" }) {
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0]?.toUpperCase() ?? "?");

  const cls = size === "lg"
    ? "h-14 w-14 text-lg rounded-xl ring-2 ring-white/[0.12]"
    : "h-8 w-8 text-[11px] rounded-full ring-1 ring-white/[0.15]";

  return (
    <div className={`flex shrink-0 overflow-hidden ${cls}`}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500 to-violet-600 font-bold text-white">
          {initials}
        </div>
      )}
    </div>
  );
}

export function AppTopbar({ user }: AppTopbarProps) {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.08] bg-[#0f0f0f] px-5">
      <Link
        href="/dashboard"
        className="shrink-0 text-base font-bold tracking-tight transition-opacity hover:opacity-80 bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-transparent"
      >
        Keyframe
      </Link>

      {user && (
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 rounded border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
            <span className="material-symbols-rounded text-[13px] text-amber-400">bolt</span>
            {user.credits}
          </div>

          {/* Profile dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="outline-none">
                <Avatar user={user} size="sm" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-2xl shadow-black/60 outline-none animate-in fade-in-0 zoom-in-95"
              >
                {/* Identity header */}
                <div className="flex items-center gap-3 px-4 py-4">
                  <Avatar user={user} size="lg" />
                  <div className="min-w-0">
                    {user.name && (
                      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    )}
                    <p className="truncate text-xs text-white/50">{user.email}</p>
                  </div>
                </div>

                <div className="mx-3 border-t border-white/[0.06]" />

                {/* Navigation items */}
                <div className="p-1.5">
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 outline-none transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <span className="material-symbols-rounded text-[17px] text-white/40">settings</span>
                      Settings
                    </Link>
                  </DropdownMenu.Item>
                </div>

                <div className="mx-3 border-t border-white/[0.06]" />

                {/* Sign out */}
                <div className="p-1.5">
                  {!logoutConfirmOpen ? (
                    <DropdownMenu.Item
                      onSelect={(e) => { e.preventDefault(); setLogoutConfirmOpen(true); }}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 outline-none transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <span className="material-symbols-rounded text-[17px] text-white/40">logout</span>
                      Sign out
                    </DropdownMenu.Item>
                  ) : (
                    <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                      <p className="mb-2.5 text-xs text-white/60">Sign out of Keyframe?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLogoutConfirmOpen(false)}
                          className="flex-1 rounded-md border border-white/[0.1] bg-white/[0.04] py-1.5 text-xs text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white/90"
                        >
                          Cancel
                        </button>
                        <form action={logout} className="flex-1">
                          <button
                            type="submit"
                            className="w-full rounded-md bg-red-500/15 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25 hover:text-red-300"
                          >
                            Sign out
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}
    </header>
  );
}
