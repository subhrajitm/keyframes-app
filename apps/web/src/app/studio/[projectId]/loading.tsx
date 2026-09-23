export default function StudioLoading() {
  return (
    <div className="flex h-screen flex-col bg-[#080808] text-white">
      {/* Toolbar skeleton */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#111111] px-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-4 w-px bg-white/10" />
          <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-14 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-8 w-8 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-8 w-28 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-8 w-28 animate-pulse rounded bg-white/[0.06]" />
        </div>
      </div>

      {/* Director bar skeleton */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0d0d0d] px-4">
        <div className="h-4 w-4 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 flex-1 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-7 w-20 animate-pulse rounded bg-white/[0.06]" />
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-center justify-center bg-[#080808]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-rounded animate-spin text-[36px] text-white/15">
            progress_activity
          </span>
          <p className="text-sm text-white/20">Loading project…</p>
        </div>
      </div>
    </div>
  );
}
