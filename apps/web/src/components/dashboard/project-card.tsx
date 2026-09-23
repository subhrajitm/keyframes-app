"use client";

import Link from "next/link";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { deleteProject } from "@/app/(dashboard)/dashboard/actions";
import type { Project } from "@keyframe/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  complete:   { label: "Complete",     color: "text-emerald-400", dot: "bg-emerald-400" },
  generating: { label: "Generating…",  color: "text-amber-400",   dot: "bg-amber-400 animate-pulse" },
  draft:      { label: "Draft",        color: "text-white/30",    dot: "bg-white/20" },
};

export function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft;
  const isVideo = project.thumbnail_url?.endsWith(".mp4") || project.thumbnail_url?.includes("/videos/");

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded border border-white/[0.08] bg-[#111111] transition-colors hover:border-white/20 ${menuOpen ? "border-white/20" : ""}`}>

      {/* ── Thumbnail ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/[0.025]">
        {/* Link covers the thumbnail area — sibling to the menu, not a wrapper */}
        <Link href={`/studio/${project.id}`} className="absolute inset-0 z-0">
          {project.thumbnail_url && isVideo ? (
            <video src={project.thumbnail_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-rounded text-[36px] text-white/[0.06]">movie</span>
            </div>
          )}
        </Link>

        {/* Status badge — top left */}
        {project.status === "generating" && (
          <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 backdrop-blur-sm">
            <span className="material-symbols-rounded text-[10px] text-amber-400">progress_activity</span>
            <span className="text-[10px] font-semibold text-amber-400">Generating</span>
          </div>
        )}

        {/* Three-dot menu — sits above the Link as a sibling, not inside it */}
        <div className="absolute right-2 top-2 z-10">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/50 opacity-0 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white group-hover:opacity-100"
              >
                <span className="material-symbols-rounded text-[16px]">more_horiz</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 min-w-[140px] overflow-hidden rounded border border-white/[0.08] bg-[#1e1e1e] py-1 shadow-2xl"
            >
              {project.status === "complete" && project.thumbnail_url && (
                <DropdownMenuItem asChild>
                  <a
                    href={project.thumbnail_url}
                    download={`${project.title}.mp4`}
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white/60 outline-none hover:bg-white/[0.05] hover:text-white"
                  >
                    <span className="material-symbols-rounded text-[14px]">download</span>
                    Download
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-red-400/80 outline-none hover:bg-red-500/[0.08] hover:text-red-300"
                onClick={() => setConfirmOpen(true)}
              >
                <span className="material-symbols-rounded text-[14px]">delete</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-white/[0.09] bg-[#111111] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <span className="material-symbols-rounded text-[18px] text-red-400">delete</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delete project?</p>
                <p className="mt-1 text-sm text-white/40 leading-relaxed">
                  <span className="text-white/60">&ldquo;{project.title}&rdquo;</span> will be permanently deleted along with all its scenes and generated assets. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmOpen(false); deleteProject(project.id); }}
                className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-3">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/[0.07] bg-white/[0.03]">
            <span className="material-symbols-rounded text-[11px] text-white/35">movie</span>
          </div>
          <Link href={`/studio/${project.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white/85 hover:text-white transition-colors">
              {project.title}
            </p>
          </Link>
          <Link href={`/studio/${project.id}`} className="shrink-0 text-white/20 hover:text-white/50 transition-colors">
            <span className="material-symbols-rounded text-[14px]">open_in_new</span>
          </Link>
        </div>

        {/* Timestamps */}
        <p className="mt-1.5 text-[11px] text-white/25" suppressHydrationWarning>
          Updated {formatRelativeTime(project.updated_at)}
        </p>

        {/* Bottom status badge */}
        <div className="mt-3">
          <div
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px]"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            <span className={cfg.color}>{cfg.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
