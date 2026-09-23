"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <span className="material-symbols-rounded mb-4 text-[40px] text-red-400/50">warning</span>
      <h2 className="text-base font-semibold text-white/70">Failed to load</h2>
      <p className="mt-1.5 text-sm text-white/35">
        {error.message || "Something went wrong loading this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white/80"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white/80"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
