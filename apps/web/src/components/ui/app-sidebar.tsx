"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions";

const NAV_ITEMS = [
  { id: "home",      icon: "home",          label: "Home" },
  { id: "projects",  icon: "video_library", label: "All Projects" },
  { id: "templates", icon: "auto_stories",  label: "Templates" },
];

const ASSET_ITEMS = [
  { id: "characters", icon: "face",        label: "Characters" },
  { id: "locations",  icon: "location_on", label: "Locations" },
];

interface NavItemProps {
  id: string;
  icon: string;
  label: string;
  activeId: string;
  badge?: React.ReactNode;
  onSectionClick?: (id: string) => void;
}

function NavItem({ id, icon, label, activeId, badge, onSectionClick }: NavItemProps) {
  const active = activeId === id;
  const cls = `flex items-center gap-2.5 rounded px-2.5 py-2 text-left text-xs font-medium transition-all w-full ${
    active
      ? "bg-gradient-to-r from-rose-500/20 to-violet-500/10"
      : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
  }`;
  const iconCls = `material-symbols-rounded text-[16px] ${active ? "text-rose-400" : "text-white/40"}`;
  const inner = (
    <>
      <span className={iconCls}>{icon}</span>
      <span className={active ? "bg-gradient-to-r from-rose-300 to-violet-300 bg-clip-text text-transparent" : ""}>{label}</span>
      {badge}
    </>
  );

  if (onSectionClick) {
    return (
      <button onClick={() => onSectionClick(id)} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={id === "home" ? "/dashboard" : `/dashboard?s=${id}`} className={cls}>
      {inner}
    </Link>
  );
}

interface AppSidebarProps {
  activeId: string;
  projectCount?: number;
  /** When provided, Library/Asset items fire this callback instead of navigating. */
  onSectionClick?: (id: string) => void;
}

export function AppSidebar({ activeId, projectCount = 0, onSectionClick }: AppSidebarProps) {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.08] bg-[#0f0f0f]">

      <div className="px-4 pt-4 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">Library</p>
      </div>

      <nav className="flex flex-col gap-px px-2">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            activeId={activeId}
            onSectionClick={onSectionClick}
            badge={
              item.id === "projects" && projectCount > 0 ? (
                <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] tabular-nums ${activeId === "projects" ? "bg-gradient-to-r from-rose-500/25 to-violet-500/15 text-rose-300" : "bg-white/[0.06] text-white/30"}`}>
                  {projectCount}
                </span>
              ) : undefined
            }
          />
        ))}

        <Link
          href="/gallery"
          className={`flex items-center gap-2.5 rounded px-2.5 py-2 text-xs font-medium transition-all ${
            activeId === "gallery"
              ? "bg-gradient-to-r from-rose-500/20 to-violet-500/10"
              : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
          }`}
        >
          <span className={`material-symbols-rounded text-[16px] ${activeId === "gallery" ? "text-rose-400" : "text-white/40"}`}>
            photo_library
          </span>
          <span className={activeId === "gallery" ? "bg-gradient-to-r from-rose-300 to-violet-300 bg-clip-text text-transparent" : ""}>Gallery</span>
        </Link>
      </nav>

      <div className="mt-5 px-4 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">Assets</p>
      </div>
      <nav className="flex flex-col gap-px px-2">
        {ASSET_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            activeId={activeId}
            onSectionClick={onSectionClick}
            badge={
              <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/25 tabular-nums">0</span>
            }
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/[0.08] p-2">
        {logoutConfirmOpen ? (
          <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 animate-in fade-in-0 zoom-in-95 duration-150">
            <p className="mb-2.5 text-[11px] text-white/50">Sign out of Keyframe?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 rounded border border-white/[0.1] py-1.5 text-[11px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
              >
                Cancel
              </button>
              <form action={logout} className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded bg-red-500/15 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/25 hover:text-red-300"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className="flex flex-1 items-center gap-2.5 rounded px-2.5 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/85"
            >
              <span className="material-symbols-rounded text-[16px] text-white/40">settings</span>
              Settings
            </Link>
            <button
              type="button"
              title="Sign out"
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex items-center justify-center rounded p-2 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
            >
              <span className="material-symbols-rounded text-[16px]">logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
