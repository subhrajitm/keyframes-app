import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <p className="text-7xl font-bold text-white/10">404</p>
      <h1 className="mt-4 text-lg font-semibold text-white/70">Page not found</h1>
      <p className="mt-2 text-sm text-white/35">This page doesn&apos;t exist.</p>
      <Link
        href="/dashboard"
        className="mt-8 flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white/80"
      >
        <span className="material-symbols-rounded text-[16px]">arrow_back</span>
        Back to dashboard
      </Link>
    </div>
  );
}
