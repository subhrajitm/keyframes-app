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

const STATUS_DOT: Record<string, string> = {
  complete:   "bg-green-400",
  generating: "bg-yellow-400 animate-pulse",
  draft:      "bg-white/20",
};

const STATUS_LABEL: Record<string, string> = {
  complete:   "Complete",
  generating: "Generating…",
  draft:      "Draft",
};

export function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isVideo = project.thumbnail_url?.endsWith(".mp4") ||
                  project.thumbnail_url?.includes("/videos/");

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/[0.04] transition-colors hover:bg-white/[0.07] ${menuOpen ? "bg-white/[0.07]" : ""}`}>
      {/* Thumbnail */}
      <Link href={`/studio/${project.id}`}>
        <div className="aspect-video w-full overflow-hidden bg-white/[0.03]">
          {project.status === "complete" && project.thumbnail_url && isVideo ? (
            <video
              src={project.thumbnail_url}
              className="h-full w-full object-cover"
              muted loop autoPlay playsInline
            />
          ) : project.thumbnail_url && !isVideo ? (
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-rounded text-[32px] text-white/10">movie</span>
            </div>
          )}
        </div>
      </Link>

      {/* Three-dot menu */}
      <DropdownMenu onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm">
            <span className="material-symbols-rounded text-[16px]">more_vert</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-50 min-w-[140px] rounded-xl border border-white/10 bg-[#1a1a2e] p-1 text-sm text-white shadow-xl"
        >
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-red-400 outline-none hover:bg-white/5"
            onClick={() => deleteProject(project.id)}
          >
            <span className="material-symbols-rounded text-[16px]">delete</span>
            Delete
          </DropdownMenuItem>
          {project.status === "complete" && project.thumbnail_url && (
            <DropdownMenuItem asChild>
              <a
                href={project.thumbnail_url}
                download={`${project.title}.mp4`}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-white/70 outline-none hover:bg-white/5"
              >
                <span className="material-symbols-rounded text-[16px]">download</span>
                Download
              </a>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Info */}
      <div className="p-3">
        <Link href={`/studio/${project.id}`}>
          <p className="truncate text-sm font-medium hover:text-violet-300 transition-colors">
            {project.title}
          </p>
        </Link>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[project.status] ?? "bg-white/20"}`} />
            <span className="text-xs text-white/40">{STATUS_LABEL[project.status] ?? project.status}</span>
          </div>
          <p className="text-xs text-white/30" suppressHydrationWarning>
            {formatRelativeTime(project.updated_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
