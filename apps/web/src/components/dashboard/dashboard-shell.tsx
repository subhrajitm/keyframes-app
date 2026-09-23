"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(dashboard)/dashboard/actions";
import { ProjectCard } from "./project-card";
import { TemplateGallery } from "./template-gallery";
import { NewProjectModal } from "./new-project-modal";
import type { Project, Template } from "@keyframe/types";

interface User {
  email: string;
  name: string | null;
  credits: number;
  avatarUrl: string | null;
}

interface Props {
  user: User;
  projects: Project[];
  templates: Template[];
}

const NAV_LINKS = [
  { label: "Home",      href: "/dashboard" },
  { label: "Projects",  href: "/dashboard", active: true },
  { label: "Assets",    href: "/dashboard" },
  { label: "Gallery",   href: "/gallery" },
  { label: "Settings",  href: "/settings" },
];

const TRY_CHIPS = [
  { icon: "movie",        label: "Travel montage",     color: "#10b981" },
  { icon: "tv",           label: "Coffee brand promo",  color: "#3b82f6" },
  { icon: "bolt",         label: "Action trailer",      color: "#ef4444" },
  { icon: "music_note",   label: "Music video",         color: "#8b5cf6" },
  { icon: "photo_camera", label: "Product launch",      color: "#f59e0b" },
  { icon: "star",         label: "Featured templates",  color: "#6366f1" },
];

export function DashboardShell({ user, projects, templates }: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "templates">("projects");
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const filtered = query
    ? projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : projects;

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email[0]?.toUpperCase() ?? "?");

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center gap-6 border-b border-white/[0.06] bg-black/95 px-6 py-3 backdrop-blur-sm">
        {/* Logo */}
        <span className="shrink-0 text-sm font-bold tracking-tight">Keyframe</span>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                l.active
                  ? "bg-white/[0.07] text-white"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Credits */}
          <div className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/50">
            <span className="material-symbols-rounded text-[14px] text-white/25">bolt</span>
            {user.credits} credits
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/70"
          >
            <span className="material-symbols-rounded text-[18px]">settings</span>
          </Link>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/70"
            >
              <span className="material-symbols-rounded text-[18px]">logout</span>
            </button>
          </form>

          {/* Avatar */}
          <Link href="/settings" className="flex h-8 w-8 shrink-0 overflow-hidden rounded">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/10 text-xs font-semibold text-white">
                {initials}
              </div>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 pb-20">

        {/* ── Search bar ───────────────────────────────────────── */}
        <div className="flex gap-3 border-b border-white/[0.06] py-5">
          <div className="flex flex-1 items-center gap-3 rounded border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <span className="material-symbols-rounded text-[20px] text-white/25">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects by name…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-white/25 hover:text-white/50 transition-colors">
                <span className="material-symbols-rounded text-[16px]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={() => setNewProjectOpen(true)}
            className="flex items-center gap-2 rounded border border-white/20 px-5 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            <span className="material-symbols-rounded text-[18px]">add</span>
            New project
          </button>
        </div>

        {/* ── Try: chips ───────────────────────────────────────── */}
        {!query && (
          <div className="flex items-center gap-2 overflow-x-auto border-b border-white/[0.06] py-3" style={{ scrollbarWidth: "none" }}>
            <span className="shrink-0 text-xs text-white/25">Try:</span>
            {TRY_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className="flex shrink-0 items-center gap-1.5 rounded border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-xs text-white/45 transition-colors hover:border-white/15 hover:text-white/70"
              >
                <span
                  className="material-symbols-rounded text-[13px]"
                  style={{ color: chip.color }}
                >
                  {chip.icon}
                </span>
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Search results ───────────────────────────────────── */}
        {query && (
          <section className="pt-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Results for &ldquo;{query}&rdquo;
                </h2>
                <p className="mt-0.5 text-sm text-white/35">{filtered.length} project{filtered.length !== 1 ? "s" : ""} found</p>
              </div>
              <button onClick={() => setQuery("")} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Clear search
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
              </div>
            ) : (
              <EmptySearch query={query} onClear={() => setQuery("")} />
            )}
          </section>
        )}

        {/* ── Tabs + default view ───────────────────────────────── */}
        {!query && (
          <>
            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] pt-5 pb-0">
              {(["projects", "templates"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-white"
                      : "text-white/35 hover:text-white/65"
                  }`}
                >
                  {tab === "projects" ? "Recent Projects" : "Templates"}
                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t bg-white/70" />
                  )}
                  {tab === "projects" && projects.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/40">
                      {projects.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Projects tab */}
            {activeTab === "projects" && (
              <section className="pt-6">
                <div className="mb-5 flex justify-end">
                  <button
                    onClick={() => setNewProjectOpen(true)}
                    className="text-xs text-white/30 transition-colors hover:text-white/60"
                  >
                    + New project
                  </button>
                </div>
                {projects.length === 0 ? (
                  <EmptyProjects onNew={() => setNewProjectOpen(true)} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
                  </div>
                )}
              </section>
            )}

            {/* Templates tab */}
            {activeTab === "templates" && (
              <section className="pt-6">
                <TemplateGallery templates={templates} noHeader />
              </section>
            )}
          </>
        )}
      </main>
      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}

function EmptyProjects({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-white/[0.06] bg-white/[0.01] py-24 text-center">
      <span className="material-symbols-rounded mb-4 text-[48px] text-white/[0.07]">movie</span>
      <p className="text-base font-medium text-white/40">No projects yet</p>
      <p className="mt-1 text-sm text-white/20">Create a project or pick a template from the Templates tab</p>
      <button
        onClick={onNew}
        className="mt-6 inline-flex items-center gap-2 rounded border border-white/20 px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-white/35 hover:text-white"
      >
        <span className="material-symbols-rounded text-[18px]">add</span>
        Create your first project
      </button>
    </div>
  );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-white/[0.06] py-20 text-center">
      <span className="material-symbols-rounded mb-4 text-[40px] text-white/[0.07]">search_off</span>
      <p className="text-sm font-medium text-white/40">No projects match &ldquo;{query}&rdquo;</p>
      <button onClick={onClear} className="mt-3 text-xs text-white/30 underline underline-offset-2 hover:text-white/60 transition-colors">
        Clear search
      </button>
    </div>
  );
}
