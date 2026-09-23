import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProjectLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-4 py-16">
      <div className="w-full max-w-3xl space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-8 aspect-video w-full rounded-xl" />
      </div>
    </div>
  );
}
