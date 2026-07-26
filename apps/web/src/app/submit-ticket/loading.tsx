import { Skeleton } from "@/components/ui/skeleton";

export default function SubmitTicketLoading() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-elevated rounded-[32px] p-8 md:p-10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-10 h-4 w-32" />
        <Skeleton className="mt-4 h-14 w-full max-w-xl" />
        <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
      </section>
      <section className="surface w-full rounded-[32px] p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-3 h-5 w-full" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="mt-4 h-11 w-full" />
        <Skeleton className="mt-6 h-32 w-full" />
        <Skeleton className="mt-6 h-11 w-full rounded-2xl" />
      </section>
    </main>
  );
}
