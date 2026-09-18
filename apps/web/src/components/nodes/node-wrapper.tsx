"use client";

import { type ReactNode } from "react";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";

interface NodeWrapperProps {
  id: string;
  accentColor: string;
  icon: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function NodeWrapper({ id, accentColor, icon, title, children, className }: NodeWrapperProps) {
  const selectedNodeId = useProjectStore((s) => s.selectedNodeId);
  const selectNode = useProjectStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-xl border bg-[#0f0f1a] text-white shadow-xl transition-shadow",
        isSelected ? "border-violet-500 shadow-violet-500/20" : "border-white/10",
        className
      )}
      onClick={() => selectNode(id)}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 rounded-t-xl px-3 py-2"
        style={{ backgroundColor: `${accentColor}20`, borderBottom: `1px solid ${accentColor}30` }}
      >
        <span className="material-symbols-rounded text-[16px]" style={{ color: accentColor }}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
          {title}
        </span>
      </div>
      {/* Body */}
      <div className="p-3">{children}</div>
    </div>
  );
}
