"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2, Film, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { deleteProject } from "@/app/(dashboard)/dashboard/actions";
import type { Project } from "@keyframe/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

interface ProjectCardProps {
  project: Project;
}

const STATUS_STYLE: Record<string, string> = {
  complete:   "bg-green-500/10 text-green-400",
  generating: "bg-yellow-500/10 text-yellow-400",
  draft:      "bg-white/5 text-white/40",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const isVideo = project.thumbnail_url?.endsWith(".mp4") ||
                  project.thumbnail_url?.includes("/videos/");

  return (
    <Card className="group relative overflow-hidden transition-colors hover:border-violet-500/40">
      {/* Thumbnail / Video */}
      <Link href={`/studio/${project.id}`}>
        <div className="aspect-video w-full overflow-hidden bg-white/5">
          {project.status === "complete" && project.thumbnail_url && isVideo ? (
            <video
              src={project.thumbnail_url}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : project.thumbnail_url && !isVideo ? (
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Film className="h-8 w-8 text-white/20" />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/studio/${project.id}`}>
              <p className="truncate text-sm font-medium text-white hover:text-violet-300">
                {project.title}
              </p>
            </Link>
            <p className="mt-0.5 text-xs text-white/40">
              {formatRelativeTime(project.updated_at)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 min-w-[140px] rounded-lg border border-white/10 bg-[#1a1a2e] p-1 text-sm text-white shadow-xl"
            >
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-red-400 outline-none hover:bg-white/5"
                onClick={() => deleteProject(project.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[project.status] ?? "bg-white/5 text-white/40"}`}>
            {project.status}
          </span>

          {project.status === "complete" && project.thumbnail_url && (
            <a
              href={project.thumbnail_url}
              download={`${project.title}.mp4`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-white/40 hover:bg-white/5 hover:text-white/70"
              title="Download final video"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
