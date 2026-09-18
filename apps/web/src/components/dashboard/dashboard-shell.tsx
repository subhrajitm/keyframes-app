"use client";

import { useState } from "react";
import Link from "next/link";
import { createProject, logout } from "@/app/(dashboard)/dashboard/actions";
import { ProjectCard } from "./project-card";
import { TemplateGallery } from "./template-gallery";
import { HeroBanner } from "./hero-banner";
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

const QUICK_ACTIONS = [
  { icon: "add_circle",    label: "New Project",    desc: "Start with a blank canvas",  action: "new" },
  { icon: "auto_awesome",  label: "From Template",  desc: "Begin with a preset",        action: "template" },
  { icon: "smart_toy",     label: "AI Director",    desc: "Let AI plan your shots",     action: "director" },
  { icon: "photo_library", label: "Asset Library",  desc: "Browse your generations",    action: "assets" },
];

export function DashboardShell({ user, projects, templates }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : projects;

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : user.email[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex items-center gap-4 px-8 py-5">
        <span className="shrink-0 text-lg font-bold tracking-tight mr-2">
          <span className="text-violet-400">Key</span>frame
        </span>

        {/* Search — grows but doesn't push right items */}
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 max-w-lg">
          <span className="material-symbols-rounded text-[18px] text-white/30">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-white/30 hover:text-white/60">
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Right-side controls — pushed to the far right */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {/* New Project */}
          <form action={createProject}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]">add</span>
              New Project
            </button>
          </form>

          {/* Credits */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
            <span className="material-symbols-rounded text-[16px] text-yellow-400">toll</span>
            <span className="text-white/70">{user.credits}</span>
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <span className="material-symbols-rounded text-[20px]">settings</span>
          </Link>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <span className="material-symbols-rounded text-[20px]">logout</span>
            </button>
          </form>

          {/* Avatar → settings */}
          <Link href="/settings" className="h-9 w-9 overflow-hidden rounded-full shrink-0 block">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-violet-600 text-sm font-semibold">
                {initials}
              </div>
            )}
          </Link>
        </div>
      </header>

      <main className="px-8 pb-20 space-y-10">

        {/* ── Quick actions ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((qa) => (
            <QuickActionCard key={qa.action} {...qa} />
          ))}
        </div>

        {/* ── Hero banner (dismissible) ────────────────────────── */}
        <HeroBanner />

        {/* ── Get Inspired ─────────────────────────────────────── */}
        {templates.length > 0 && <TemplateGallery templates={templates} />}

        {/* ── Recent Projects ──────────────────────────────────── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {query ? `Results for "${query}"` : "Recent Projects"}
              {filtered.length > 0 && (
                <span className="ml-2 text-sm font-normal text-white/30">{filtered.length}</span>
              )}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg bg-white/[0.03] py-24 text-center">
              <span className="material-symbols-rounded text-[48px] text-white/10 mb-4">movie</span>
              <p className="text-base font-medium text-white/50">
                {query ? "No projects match your search" : "No projects yet"}
              </p>
              {!query && (
                <form action={createProject} className="mt-5">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-medium hover:bg-violet-500 transition-colors"
                  >
                    <span className="material-symbols-rounded text-[18px]">add</span>
                    Create your first project
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function QuickActionCard({ icon, label, desc, action }: typeof QUICK_ACTIONS[number]) {
  const inner = (
    <div className="flex items-center gap-4 rounded-lg bg-white/[0.04] px-5 py-4 hover:bg-white/[0.07] transition-colors cursor-pointer w-full text-left border border-transparent hover:border-white/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-violet-600/80">
        <span className="material-symbols-rounded text-[20px] text-white">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug">{label}</p>
        <p className="text-xs text-white/40 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  );

  if (action === "new") {
    return (
      <form action={createProject} className="contents">
        <button type="submit" className="contents">{inner}</button>
      </form>
    );
  }

  if (action === "template") {
    return <div onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}>{inner}</div>;
  }

  if (action === "assets") {
    return <Link href="/studio" className="contents">{inner}</Link>;
  }

  // director - scroll to template
  return <div>{inner}</div>;
}
