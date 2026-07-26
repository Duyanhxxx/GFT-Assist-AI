import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <main className="space-y-8 pb-10">
      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-6 w-full max-w-3xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="surface rounded-[28px] p-6" key={index}>
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="mt-6 h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ))}
      </div>

      <div className="surface rounded-[32px] p-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-16 w-full rounded-2xl" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
