"use client";

import Link from "next/link";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";

export interface AppTopbarUser {
  email: string;
  name: string | null;
  credits: number;
  avatarUrl: string | null;
}

interface AppTopbarProps {
  user?: AppTopbarUser | null;
}

export function AppTopbar({ user }: AppTopbarProps) {
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.08] bg-[#0f0f0f] px-5">
      <Link
        href="/dashboard"
        className="shrink-0 text-base font-bold tracking-tight text-white transition-opacity hover:opacity-70"
      >
        Keyframe
      </Link>

      {user && (
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 rounded border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
            <span className="material-symbols-rounded text-[13px] text-amber-400">bolt</span>
            {user.credits}
          </div>

          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/settings" title="Settings">
              <span className="material-symbols-rounded text-[18px]">settings</span>
            </Link>
          </Button>

          <form action={logout}>
            <Button variant="ghost" size="icon-sm" type="submit" title="Sign out">
              <span className="material-symbols-rounded text-[18px]">logout</span>
            </Button>
          </form>

          <Link href="/settings" className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/[0.15]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-violet-600 text-[11px] font-bold text-white">
                {initials}
              </div>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
