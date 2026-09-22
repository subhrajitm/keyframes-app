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
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft;
  const isVideo = project.thumbnail_url?.endsWith(".mp4") || project.thumbnail_url?.includes("/videos/");

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded border border-white/[0.08] bg-[#111111] transition-colors hover:border-white/20 ${menuOpen ? "border-white/20" : ""}`}>

      {/* ── Thumbnail ── */}
      <Link href={`/studio/${project.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/[0.025]">
          {project.thumbnail_url && isVideo ? (
            <video src={project.thumbnail_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-rounded text-[36px] text-white/[0.06]">movie</span>
            </div>
          )}

          {/* Status badge — top left */}
          {project.status === "generating" && (
            <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 backdrop-blur-sm">
              <span className="material-symbols-rounded text-[10px] text-amber-400">progress_activity</span>
              <span className="text-[10px] font-semibold text-amber-400">Generating</span>
            </div>
          )}

          {/* Three-dot menu — top right */}
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/50 opacity-0 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white group-hover:opacity-100"
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
                onClick={() => deleteProject(project.id)}
              >
                <span className="material-symbols-rounded text-[14px]">delete</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

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
