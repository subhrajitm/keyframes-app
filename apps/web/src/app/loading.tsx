export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <span className="material-symbols-rounded animate-spin text-[32px] text-white/20">
        progress_activity
      </span>
    </div>
  );
}
