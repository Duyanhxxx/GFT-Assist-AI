import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="surface-elevated rounded-[32px] p-8 md:p-10">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-10 h-4 w-28" />
        <Skeleton className="mt-4 h-14 w-full max-w-xl" />
        <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="surface rounded-3xl p-5" key={index}>
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <Skeleton className="mt-5 h-4 w-24" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="surface w-full max-w-lg rounded-[32px] p-8">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-3 h-5 w-full" />
          <Skeleton className="mt-8 h-11 w-full" />
          <Skeleton className="mt-5 h-11 w-full" />
          <Skeleton className="mt-6 h-11 w-full rounded-2xl" />
        </div>
      </section>
    </main>
  );
}
