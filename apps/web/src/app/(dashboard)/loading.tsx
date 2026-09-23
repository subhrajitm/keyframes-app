import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Nav skeleton */}
      <header className="flex h-14 items-center gap-6 border-b border-white/[0.06] px-6">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-1">
          {[72, 64, 56, 64].map((w, i) => <Skeleton key={i} className="h-7 rounded-md" style={{ width: w }} />)}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 pb-20">
        {/* Search bar skeleton */}
        <div className="flex gap-3 border-b border-white/[0.06] py-5">
          <Skeleton className="h-12 flex-1 rounded" />
          <Skeleton className="h-12 w-32 rounded" />
        </div>

        {/* Try chips skeleton */}
        <div className="flex gap-2 border-b border-white/[0.06] py-3">
          {[80, 120, 100, 96, 112, 104].map((w, i) => (
            <Skeleton key={i} className="h-7 shrink-0 rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* Tab bar skeleton */}
        <div className="flex gap-1 border-b border-white/[0.06] pt-5 pb-0">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        {/* Project grid skeleton */}
        <div className="pt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded border border-white/[0.06]">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="mt-3 h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
