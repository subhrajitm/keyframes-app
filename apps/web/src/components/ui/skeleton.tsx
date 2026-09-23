import { cn } from "@/lib/utils";

import React from "react";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded bg-white/[0.06]", className)} style={style} />
  );
}
