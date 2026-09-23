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
  complete:   { label: "Complete",    color: "text-emerald-400", dot: "bg-emerald-400" },
  generating: { label: "Generating…", color: "text-amber-400",   dot: "bg-amber-400 animate-pulse" },
  draft:      { label: "Draft",       color: "text-white/50",    dot: "bg-white/35" },
};

export function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft;
  const isVideo = project.thumbnail_url?.endsWith(".mp4") || project.thumbnail_url?.includes("/videos/");

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-xl border bg-[#141414] transition-all hover:shadow-lg ${
      menuOpen
        ? "border-white/25 shadow-black/40"
        : "border-white/[0.12] hover:border-white/25"
    }`}>

      {/* ── Thumbnail ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/[0.05]">
        <Link href={`/studio/${project.id}`} className="absolute inset-0 z-0">
          {project.thumbnail_url && isVideo ? (
            <video src={project.thumbnail_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-rounded text-[40px] text-white/15">movie</span>
            </div>
          )}
        </Link>

        {/* Status badge */}
        {project.status === "generating" && (
          <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-amber-500/25 px-2.5 py-1 backdrop-blur-sm">
            <span className="material-symbols-rounded text-[11px] text-amber-300">progress_activity</span>
            <span className="text-[11px] font-semibold text-amber-300">Generating</span>
          </div>
        )}

        {/* Three-dot menu */}
        <div className="absolute right-2 top-2 z-10">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/60 opacity-0 backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white group-hover:opacity-100">
                <span className="material-symbols-rounded text-[17px]">more_horiz</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 min-w-[150px] overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1a1a] py-1.5 shadow-2xl"
            >
              {project.status === "complete" && project.thumbnail_url && (
                <DropdownMenuItem asChild>
                  <a
                    href={project.thumbnail_url}
                    download={`${project.title}.mp4`}
                    className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-sm text-white/65 outline-none hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="material-symbols-rounded text-[15px]">download</span>
                    Download
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 outline-none hover:bg-red-500/10 hover:text-red-300"
                onClick={() => setConfirmOpen(true)}
              >
                <span className="material-symbols-rounded text-[15px]">delete</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#141414] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                <span className="material-symbols-rounded text-[20px] text-red-400">delete</span>
              </div>
              <div>
                <p className="text-base font-semibold text-white">Delete project?</p>
                <p className="mt-1.5 text-sm text-white/50 leading-relaxed">
                  <span className="font-medium text-white/75">&ldquo;{project.title}&rdquo;</span> and all its scenes and assets will be permanently deleted. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmOpen(false); deleteProject(project.id); }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title row */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05]">
            <span className="material-symbols-rounded text-[13px] text-white/50">movie</span>
          </div>
          <Link href={`/studio/${project.id}`} className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white hover:text-white/80 transition-colors">
              {project.title}
            </p>
          </Link>
          <Link href={`/studio/${project.id}`} className="shrink-0 text-white/30 hover:text-white/65 transition-colors">
            <span className="material-symbols-rounded text-[15px]">open_in_new</span>
          </Link>
        </div>

        {/* Timestamp */}
        <p className="mt-1.5 text-xs text-white/40" suppressHydrationWarning>
          Updated {formatRelativeTime(project.updated_at)}
        </p>

        {/* Status badge */}
        <div className="mt-3.5">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            <span className={cfg.color}>{cfg.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
