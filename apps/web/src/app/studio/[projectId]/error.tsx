"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StudioError({
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
    <div className="flex h-screen flex-col items-center justify-center bg-[#080808] text-white">
      <span className="material-symbols-rounded mb-4 text-[40px] text-red-400/40">error</span>
      <h2 className="text-base font-semibold text-white/60">Failed to load studio</h2>
      <p className="mt-2 text-sm text-white/30">
        {error.message || "An error occurred while loading this project."}
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
