"use client";

import { useEffect } from "react";

export default function GalleryError({
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
      <span className="material-symbols-rounded mb-4 text-[40px] text-white/10">broken_image</span>
      <p className="text-sm font-medium text-white/40">Failed to load gallery</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
      >
        Try again
      </button>
    </div>
  );
}
