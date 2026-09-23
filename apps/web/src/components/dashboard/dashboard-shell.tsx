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
  { icon: "movie",        label: "Travel montage",    color: "#10b981" },
  { icon: "tv",           label: "Coffee brand promo", color: "#3b82f6" },
  { icon: "bolt",         label: "Action trailer",     color: "#ef4444" },
  { icon: "music_note",   label: "Music video",        color: "#8b5cf6" },
  { icon: "photo_camera", label: "Product launch",     color: "#f59e0b" },
  { icon: "star",         label: "Featured templates", color: "#6366f1" },
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
      <header className="sticky top-0 z-40 flex items-center gap-6 border-b border-white/[0.12] bg-black/95 px-6 py-3.5 backdrop-blur-sm">
        {/* Logo */}
        <span className="shrink-0 text-base font-bold tracking-tight text-white">Keyframe</span>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                l.active
                  ? "bg-white/[0.12] text-white"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2.5 shrink-0">
          {/* Credits */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.15] bg-white/[0.05] px-3 py-2 text-sm text-white/70">
            <span className="material-symbols-rounded text-[15px] text-amber-400">bolt</span>
            {user.credits} credits
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/80"
          >
            <span className="material-symbols-rounded text-[20px]">settings</span>
          </Link>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/80"
            >
              <span className="material-symbols-rounded text-[20px]">logout</span>
            </button>
          </form>

          {/* Avatar */}
          <Link href="/settings" className="flex h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.15]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/15 text-sm font-bold text-white">
                {initials}
              </div>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 pb-20">

        {/* ── Search bar ───────────────────────────────────────── */}
        <div className="flex gap-3 border-b border-white/[0.1] py-5">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-3.5">
            <span className="material-symbols-rounded text-[20px] text-white/45">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects by name…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-white/40 hover:text-white/70 transition-colors">
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={() => setNewProjectOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/50 hover:text-white hover:bg-white/[0.05]"
          >
            <span className="material-symbols-rounded text-[18px]">add</span>
            New project
          </button>
        </div>

        {/* ── Try: chips ───────────────────────────────────────── */}
        {!query && (
          <div className="flex items-center gap-2 overflow-x-auto border-b border-white/[0.1] py-3.5" style={{ scrollbarWidth: "none" }}>
            <span className="shrink-0 text-xs font-semibold text-white/40">Try:</span>
            {TRY_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/65 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white/90"
              >
                <span className="material-symbols-rounded text-[14px]" style={{ color: chip.color }}>
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
                <h2 className="text-xl font-bold text-white">
                  Results for &ldquo;{query}&rdquo;
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <button onClick={() => setQuery("")} className="text-sm text-white/45 hover:text-white/75 transition-colors">
                Clear search
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
            <div className="flex items-center gap-1 border-b border-white/[0.1] pt-5 pb-0">
              {(["projects", "templates"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tab === "projects" ? "Recent Projects" : "Templates"}
                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t bg-white" />
                  )}
                  {tab === "projects" && projects.length > 0 && (
                    <span className="ml-2 rounded-full bg-white/[0.12] px-2 py-0.5 text-[11px] font-medium text-white/60">
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
                    className="text-sm font-medium text-white/45 transition-colors hover:text-white/75"
                  >
                    + New project
                  </button>
                </div>
                {projects.length === 0 ? (
                  <EmptyProjects onNew={() => setNewProjectOpen(true)} />
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.02] py-24 text-center">
      <span className="material-symbols-rounded mb-4 text-[52px] text-white/20">movie</span>
      <p className="text-base font-semibold text-white/60">No projects yet</p>
      <p className="mt-1.5 text-sm text-white/35">Create a project or pick a template from the Templates tab</p>
      <button
        onClick={onNew}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white hover:bg-white/[0.05]"
      >
        <span className="material-symbols-rounded text-[18px]">add</span>
        Create your first project
      </button>
    </div>
  );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.1] py-20 text-center">
      <span className="material-symbols-rounded mb-4 text-[44px] text-white/20">search_off</span>
      <p className="text-sm font-semibold text-white/55">No projects match &ldquo;{query}&rdquo;</p>
      <button onClick={onClear} className="mt-3 text-sm text-white/40 underline underline-offset-2 hover:text-white/70 transition-colors">
        Clear search
      </button>
    </div>
  );
}
