import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="h-36 w-full rounded-xl bg-white" />
      <div className="grid gap-6 lg:grid-cols-[1fr_44vw]">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl bg-white" />
          ))}
        </div>
        <Skeleton className="hidden h-[70vh] rounded-xl bg-white lg:block" />
      </div>
    </div>
  );
}
