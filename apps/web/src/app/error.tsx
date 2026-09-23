"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
      <span className="material-symbols-rounded mb-4 text-[48px] text-red-400/50">error</span>
      <h1 className="text-lg font-semibold text-white/70">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-white/35">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white/80"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white/80"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
