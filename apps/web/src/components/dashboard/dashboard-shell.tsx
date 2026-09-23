"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(dashboard)/dashboard/actions";
import { ProjectCard } from "./project-card";
import { TemplateGallery } from "./template-gallery";
import { NewProjectModal } from "./new-project-modal";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
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

type Section = "home" | "projects" | "templates" | "characters" | "locations";

const NAV_ITEMS = [
  { id: "home" as Section,      icon: "home",          label: "Home" },
  { id: "projects" as Section,  icon: "grid_view",     label: "All Projects" },
  { id: "templates" as Section, icon: "library_books", label: "Templates" },
];

const ASSET_ITEMS = [
  { id: "characters" as Section, icon: "person",    label: "Characters" },
  { id: "locations" as Section,  icon: "landscape", label: "Locations" },
];

export function DashboardShell({ user, projects, templates }: Props) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Section>("home");
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email[0]?.toUpperCase() ?? "?");

  const filtered = query
    ? projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : projects;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0f0f0f] text-white">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="flex h-10 shrink-0 items-center gap-4 border-b border-white/[0.08] bg-[#0f0f0f] px-3">
        <span className="shrink-0 text-sm font-bold tracking-tight text-white">Keyframe</span>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center gap-1 rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-xs text-white/60">
            <span className="material-symbols-rounded text-[12px] text-amber-400">bolt</span>
            {user.credits}
          </div>

          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/settings" title="Settings">
              <span className="material-symbols-rounded text-[16px]">settings</span>
            </Link>
          </Button>

          <form action={logout}>
            <Button variant="ghost" size="icon-sm" type="submit" title="Sign out">
              <span className="material-symbols-rounded text-[16px]">logout</span>
            </Button>
          </form>

          <Link href="/settings" className="flex h-7 w-7 shrink-0 overflow-hidden rounded ring-1 ring-white/[0.15]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-violet-600 text-[11px] font-bold text-white">
                {initials}
              </div>
            )}
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────── */}
        <aside className="flex w-48 shrink-0 flex-col border-r border-white/[0.08] bg-[#0f0f0f]">

          <div className="px-3 pt-3 pb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/25">Library</p>
          </div>

          <nav className="flex flex-col gap-px px-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                  section === item.id
                    ? "bg-violet-500/15 text-violet-300 font-medium"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
                }`}
              >
                <span className={`material-symbols-rounded text-[15px] ${section === item.id ? "text-violet-400" : ""}`}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "projects" && projects.length > 0 && (
                  <span className={`ml-auto text-[10px] ${section === item.id ? "text-violet-400/70" : "text-white/30"}`}>{projects.length}</span>
                )}
              </button>
            ))}

            <Link
              href="/gallery"
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/80"
            >
              <span className="material-symbols-rounded text-[15px]">public</span>
              Gallery
            </Link>
          </nav>

          <div className="mt-4 px-3 pb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/25">Assets</p>
          </div>
          <nav className="flex flex-col gap-px px-1.5">
            {ASSET_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                  section === item.id
                    ? "bg-violet-500/15 text-violet-300 font-medium"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
                }`}
              >
                <span className={`material-symbols-rounded text-[15px] ${section === item.id ? "text-violet-400" : ""}`}>{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] text-white/25">0</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/[0.08] p-2">
            <Button variant="violet" size="sm" className="w-full" onClick={() => setNewProjectOpen(true)}>
              <span className="material-symbols-rounded text-[14px]">add</span>
              New project
            </Button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#111111]">

          {/* Search bar */}
          <div className="shrink-0 border-b border-white/[0.08] px-4 py-2">
            <div className="flex items-center gap-2 rounded border border-white/[0.1] bg-white/[0.04] px-3 py-1.5">
              <span className="material-symbols-rounded text-[15px] text-white/35">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects and templates…"
                className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-white/30 hover:text-white/60 transition-colors">
                  <span className="material-symbols-rounded text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">

            {/* Search results */}
            {query && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    &ldquo;{query}&rdquo;
                    <span className="ml-1.5 text-xs font-normal text-white/40">{filtered.length} found</span>
                  </p>
                  <button onClick={() => setQuery("")} className="text-xs text-white/40 hover:text-white/70 transition-colors">Clear</button>
                </div>
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
                  </div>
                ) : (
                  <EmptySearch onClear={() => setQuery("")} />
                )}
              </div>
            )}

            {/* Home */}
            {!query && section === "home" && (
              <>
                <SectionHeader title="Recent Projects" onSeeAll={() => setSection("projects")}>
                  <Button variant="ghost" size="xs" onClick={() => setNewProjectOpen(true)} className="text-violet-400 hover:bg-violet-500/10 hover:text-violet-300">
                    <span className="material-symbols-rounded text-[13px]">add</span>
                    New
                  </Button>
                </SectionHeader>

                {projects.length === 0 ? (
                  <EmptyProjects onNew={() => setNewProjectOpen(true)} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {projects.slice(0, 10).map((p) => <ProjectCard key={p.id} project={p} />)}
                  </div>
                )}

                {templates.length > 0 && (
                  <div className="mt-7">
                    <SectionHeader title="Templates" onSeeAll={() => setSection("templates")} />
                    <TemplateGallery templates={templates} noHeader />
                  </div>
                )}
              </>
            )}

            {/* All Projects */}
            {!query && section === "projects" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    All Projects
                    {projects.length > 0 && <span className="ml-1.5 text-xs font-normal text-white/40">{projects.length}</span>}
                  </p>
                  <Button variant="violet" size="xs" onClick={() => setNewProjectOpen(true)}>
                    <span className="material-symbols-rounded text-[13px]">add</span>
                    New project
                  </Button>
                </div>
                {projects.length === 0 ? (
                  <EmptyProjects onNew={() => setNewProjectOpen(true)} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
                  </div>
                )}
              </>
            )}

            {/* Templates */}
            {!query && section === "templates" && (
              <>
                <p className="mb-4 text-sm font-semibold text-white">Templates</p>
                {templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="material-symbols-rounded mb-3 text-[36px] text-white/15">library_books</span>
                    <p className="text-xs text-white/40">No templates yet</p>
                  </div>
                ) : (
                  <TemplateGallery templates={templates} noHeader />
                )}
              </>
            )}

            {/* Assets placeholder */}
            {!query && (section === "characters" || section === "locations") && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-rounded mb-3 text-[40px] text-white/10">
                  {section === "characters" ? "person" : "landscape"}
                </span>
                <p className="text-sm font-medium text-white/40 capitalize">{section}</p>
                <p className="mt-1 text-xs text-white/25">Assets created in Studio appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}


function EmptyProjects({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-dashed border-white/[0.1] py-16 text-center">
      <span className="material-symbols-rounded mb-3 text-[40px] text-white/12">movie</span>
      <p className="text-sm font-medium text-white/50">No projects yet</p>
      <p className="mt-1 text-xs text-white/30">Create a project to get started</p>
      <Button variant="violet" size="sm" className="mt-4" onClick={onNew}>
        <span className="material-symbols-rounded text-[14px]">add</span>
        Create project
      </Button>
    </div>
  );
}

function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-dashed border-white/[0.1] py-14 text-center">
      <span className="material-symbols-rounded mb-3 text-[36px] text-white/12">search_off</span>
      <p className="text-xs font-medium text-white/45">No results found</p>
      <button onClick={onClear} className="mt-2 text-xs text-white/30 underline underline-offset-2 hover:text-white/55 transition-colors">
        Clear search
      </button>
    </div>
  );
}
