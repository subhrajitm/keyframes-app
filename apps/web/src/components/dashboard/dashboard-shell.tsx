"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./project-card";
import { TemplateGallery } from "./template-gallery";
import { NewProjectModal } from "./new-project-modal";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { AppTopbar } from "@/components/ui/app-topbar";
import { AppSidebar } from "@/components/ui/app-sidebar";
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
  initialSection?: Section;
}

type Section = "home" | "projects" | "templates" | "characters" | "locations";

export function DashboardShell({ user, projects, templates, initialSection = "home" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Section>(initialSection);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const navigateSection = useCallback((id: Section) => {
    setSection(id);
    const url = id === "home" ? "/dashboard" : `/dashboard?s=${id}`;
    router.replace(url, { scroll: false });
  }, [router]);

  const filtered = query
    ? projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : projects;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0f0f0f] text-white">

      <AppTopbar user={{ email: user.email, name: user.name, credits: user.credits, avatarUrl: user.avatarUrl }} />

      <div className="flex flex-1 overflow-hidden">

        <AppSidebar
          activeId={section}
          projectCount={projects.length}
          onSectionClick={(id) => navigateSection(id as Section)}
        />

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#111111]">

          {/* Search bar */}
          <div className="shrink-0 flex items-center gap-2 border-b border-white/[0.08] px-4 py-2">
            <div className="flex flex-1 items-center gap-2 rounded border border-white/[0.1] bg-white/[0.04] px-3 py-1.5">
              <span className="material-symbols-rounded text-[15px] text-white/35">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                section === "characters" ? "Search characters…"
                : section === "locations" ? "Search locations…"
                : "Search projects and templates…"
              }
                className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-white/30 hover:text-white/60 transition-colors">
                  <span className="material-symbols-rounded text-[14px]">close</span>
                </button>
              )}
            </div>
            {section === "characters" || section === "locations" ? (
              <Button variant="outline" size="sm">
                <span className="material-symbols-rounded text-[14px]">add</span>
                New {section === "characters" ? "character" : "location"}
              </Button>
            ) : (
              <Button variant="violet" size="sm" onClick={() => setNewProjectOpen(true)}>
                <span className="material-symbols-rounded text-[14px]">add</span>
                New project
              </Button>
            )}
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
                <SectionHeader title="Recent Projects" onSeeAll={() => navigateSection("projects")} />

                {projects.length === 0 ? (
                  <EmptyProjects onNew={() => setNewProjectOpen(true)} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {projects.slice(0, 10).map((p) => <ProjectCard key={p.id} project={p} />)}
                  </div>
                )}

                {templates.length > 0 && (
                  <div className="mt-7">
                    <SectionHeader title="Templates" onSeeAll={() => navigateSection("templates")} />
                    <TemplateGallery templates={templates} noHeader />
                  </div>
                )}
              </>
            )}

            {/* All Projects */}
            {!query && section === "projects" && (
              <>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">
                    All Projects
                    {projects.length > 0 && <span className="ml-1.5 text-xs font-normal text-white/40">{projects.length}</span>}
                  </p>
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

            {/* Characters / Locations */}
            {!query && (section === "characters" || section === "locations") && (
              <>
                <div className="mb-6">
                  <h1 className="text-base font-semibold text-white capitalize">{section}</h1>
                </div>

                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03]">
                    <span className="material-symbols-rounded text-[28px] text-white/25">
                      {section === "characters" ? "face" : "location_on"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white/75">
                    No {section === "characters" ? "characters" : "locations"} yet
                  </p>
                  <p className="mt-1.5 text-xs text-white/40">
                    {section === "characters"
                      ? "Create a reusable character from reference images."
                      : "Define reusable locations for your scenes."}
                  </p>
                  <Button variant="outline" size="sm" className="mt-5">
                    <span className="material-symbols-rounded text-[14px]">add</span>
                    New {section === "characters" ? "character" : "location"}
                  </Button>
                </div>
              </>
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
