"use client";

import { useEffect, useState } from "react";
import { createProject } from "@/app/(dashboard)/dashboard/actions";

const STORAGE_KEY = "kf_hero_dismissed";

export function HeroBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={dismiss}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/40 hover:bg-white/10 hover:text-white transition-colors"
      >
        <span className="material-symbols-rounded text-[18px]">close</span>
      </button>

      <div className="flex flex-col gap-8 p-10 sm:flex-row sm:items-center">
        {/* Decorative visual */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-black sm:h-56 sm:w-72">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col gap-2 opacity-30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-md bg-white/20" style={{ width: `${120 + i * 20}px` }} />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <span className="material-symbols-rounded text-[32px] text-white/80">play_arrow</span>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Create your first<br />AI film today
          </h2>
          <p className="max-w-md text-base text-white/50 leading-relaxed">
            Build cinematic AI-generated videos with a node-based canvas. Design characters, locations, and shots — then let the Director plan everything.
          </p>
          <form action={createProject}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-base font-semibold hover:bg-violet-500 transition-colors"
            >
              Get Started
              <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
