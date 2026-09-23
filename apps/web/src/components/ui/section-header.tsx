import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  children?: ReactNode;
}

export function SectionHeader({ title, onSeeAll, children }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-semibold text-white/90">{title}</p>
      <div className="flex items-center gap-2">
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="rounded border border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/50 transition-colors hover:border-white/25 hover:text-white/80"
          >
            See all
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
