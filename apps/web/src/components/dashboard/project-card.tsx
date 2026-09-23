"use client";

import Link from "next/link";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { deleteProject } from "@/app/(dashboard)/dashboard/actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
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
  draft:      { label: "Draft",       color: "text-white/45",    dot: "bg-white/30" },
};

export function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft;
  const isVideo = project.thumbnail_url?.endsWith(".mp4") || project.thumbnail_url?.includes("/videos/");

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded border bg-[#141414] transition-all ${
      menuOpen ? "border-white/20" : "border-white/[0.1] hover:border-white/20"
    }`}>

      {/* ── Thumbnail ── */}
      <div className="relative aspect-video w-full overflow-hidden bg-white/[0.04]">
        <Link href={`/studio/${project.id}`} className="absolute inset-0 z-0">
          {project.thumbnail_url && isVideo ? (
            <video src={project.thumbnail_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-rounded text-[28px] text-white/10">movie</span>
            </div>
          )}
        </Link>

        {project.status === "generating" && (
          <div className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 backdrop-blur-sm">
            <span className="material-symbols-rounded text-[10px] text-amber-300">progress_activity</span>
            <span className="text-[10px] font-medium text-amber-300">Generating</span>
          </div>
        )}

        <div className="absolute right-1.5 top-1.5 z-10">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-black/70 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/85 hover:text-white group-hover:opacity-100">
                <span className="material-symbols-rounded text-[14px]">more_horiz</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 min-w-[130px] overflow-hidden rounded border border-white/[0.1] bg-[#1a1a1a] py-1 shadow-xl"
            >
              {project.status === "complete" && project.thumbnail_url && (
                <DropdownMenuItem asChild>
                  <a
                    href={project.thumbnail_url}
                    download={`${project.title}.mp4`}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-white/60 outline-none hover:bg-white/[0.05] hover:text-white"
                  >
                    <span className="material-symbols-rounded text-[13px]">download</span>
                    Download
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-red-400 outline-none hover:bg-red-500/10 hover:text-red-300"
                onClick={() => setConfirmOpen(true)}
              >
                <span className="material-symbols-rounded text-[13px]">delete</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-500/10">
            <span className="material-symbols-rounded text-[16px] text-red-400">delete</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Delete project?</p>
            <p className="mt-1 text-xs text-white/45 leading-relaxed">
              <span className="font-medium text-white/70">&ldquo;{project.title}&rdquo;</span> and all its scenes will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="xs" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="xs" onClick={() => { setConfirmOpen(false); deleteProject(project.id); }}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Link href={`/studio/${project.id}`} className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white/90 hover:text-white transition-colors">
              {project.title}
            </p>
          </Link>
          <Link href={`/studio/${project.id}`} className="shrink-0 text-white/25 hover:text-white/55 transition-colors">
            <span className="material-symbols-rounded text-[13px]">open_in_new</span>
          </Link>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-[10px] text-white/35" suppressHydrationWarning>
            {formatRelativeTime(project.updated_at)}
          </p>
          <div
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />
            <span className={cfg.color}>{cfg.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
