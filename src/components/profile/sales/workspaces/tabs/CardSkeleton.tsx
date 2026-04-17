export default function CardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm animate-pulse dark:border-[#333] dark:bg-[#1e1e1e] dark:shadow-none">
      <div className="h-4 w-3/4 rounded bg-neutral-200 mb-3 dark:bg-[#333]" />
      <div className="h-3 w-1/3 rounded bg-neutral-200 mb-4 dark:bg-[#333]" />
      <div className="flex justify-between items-center">
        <div className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-[#333]" />
        <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-[#333]" />
      </div>
    </div>
  );
}

