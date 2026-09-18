"use client";

import { useState, type ReactNode } from "react";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";

interface NodeWrapperProps {
  id: string;
  title: string;
  icon: string;
  avatarColor: string;
  avatarIcon?: string;
  imageSlot?: ReactNode;
  charCount?: number;
  maxChars?: number;
  children?: ReactNode;
  className?: string;
  wide?: boolean;
}

export function NodeWrapper({
  id,
  title,
  icon,
  avatarColor,
  avatarIcon = "smart_toy",
  imageSlot,
  charCount,
  maxChars = 300,
  children,
  className,
  wide = false,
}: NodeWrapperProps) {
  const selectedNodeId = useProjectStore((s) => s.selectedNodeId);
  const selectNode = useProjectStore((s) => s.selectNode);
  const deleteNode = useProjectStore((s) => s.deleteNode);
  const isSelected = selectedNodeId === id;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-visible rounded-lg border bg-[#161616] text-white shadow-2xl transition-all duration-150 cursor-pointer",
        wide ? "w-[300px]" : "w-[260px]",
        isSelected
          ? "border-violet-500/50 shadow-[0_0_0_1px_rgb(139_92_246_/_0.15)]"
          : "border-white/[0.08] shadow-black/60",
        className,
      )}
      onClick={() => selectNode(id)}
    >
      {/* Image slot — clipped to card's rounded corners */}
      {imageSlot && (
        <div className="overflow-hidden rounded-t-2xl">{imageSlot}</div>
      )}

      {/* ⋯ menu — always absolute top-right */}
      <div
        className={cn("absolute right-2 z-20", imageSlot ? "top-2" : "top-1.5")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white/70",
            imageSlot
              ? "bg-black/50 backdrop-blur-sm hover:bg-black/65"
              : "hover:bg-white/[0.06]",
          )}
        >
          <span className="material-symbols-rounded text-[18px]">more_horiz</span>
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-8 z-50 min-w-[130px] overflow-hidden rounded-md border border-white/[0.08] bg-[#1e1e1e] py-1 shadow-2xl"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              onClick={() => {
                deleteNode(id);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <span className="material-symbols-rounded text-[14px]">delete</span>
              Delete node
            </button>
          </div>
        )}
      </div>

      {/* Title row */}
      <div
        className={cn(
          "flex items-center gap-2 px-3.5 pt-3 pb-1.5",
          !imageSlot && "pr-10",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate text-[11px] font-bold uppercase tracking-[0.09em] text-white/80">
            {title}
          </span>
          <span className="material-symbols-rounded shrink-0 text-[13px] text-white/25">
            {icon}
          </span>
        </div>

        {/* Colored avatar */}
        <div
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full shadow-md"
          style={{ backgroundColor: avatarColor }}
        >
          <span className="material-symbols-rounded text-[12px] text-white">
            {avatarIcon}
          </span>
        </div>
      </div>

      {/* Body */}
      {children && <div className="px-3.5 pb-2">{children}</div>}

      {/* Char count footer */}
      {typeof charCount === "number" && (
        <div className="flex justify-end px-3.5 pb-3">
          <span className="font-mono text-[10px] text-white/20">
            {charCount}/{maxChars}
          </span>
        </div>
      )}
    </div>
  );
}
