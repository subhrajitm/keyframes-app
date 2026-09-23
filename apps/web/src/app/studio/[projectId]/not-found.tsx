import Link from "next/link";

export default function StudioNotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#080808] text-white">
      <span className="material-symbols-rounded mb-4 text-[48px] text-white/10">movie_off</span>
      <h1 className="text-lg font-semibold text-white/60">Project not found</h1>
      <p className="mt-2 text-sm text-white/30">
        This project doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
      >
        <span className="material-symbols-rounded text-[16px]">arrow_back</span>
        Back to dashboard
      </Link>
    </div>
  );
}
