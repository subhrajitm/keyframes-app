import Link from "next/link";

export default function PublicProjectNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <span className="material-symbols-rounded mb-4 text-[48px] text-white/10">movie_off</span>
      <h1 className="text-lg font-semibold text-white/60">Project not available</h1>
      <p className="mt-2 text-sm text-white/30">
        This project is private or no longer exists.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/gallery"
          className="flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          Browse gallery
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          Keyframe
        </Link>
      </div>
    </div>
  );
}
