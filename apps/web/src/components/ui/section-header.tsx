import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  children?: ReactNode;
}

export function SectionHeader({ title, onSeeAll, children }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      {onSeeAll ? (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-sm font-semibold text-white/90 transition-colors hover:text-white"
        >
          {title}
          <span className="material-symbols-rounded text-[15px] text-white/30">chevron_right</span>
        </button>
      ) : (
        <p className="text-sm font-semibold text-white/90">{title}</p>
      )}

      <div className="flex items-center gap-2">
        {children}
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="rounded border border-white/[0.15] bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/65 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white/90"
          >
            See all
          </button>
        )}
      </div>
    </div>
  );
}
