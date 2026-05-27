export default function ChangelogLoadingSkeleton() {
  return (
    <div className="space-y-8 pl-10 sm:pl-12" aria-busy="true" aria-label="Cargando novedades">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-[#e0e0e0] bg-white p-8 dark:border-[#333] dark:bg-[#1a1a1a]"
        >
          <div className="h-6 w-24 rounded-lg bg-[#eeeeee] dark:bg-[#2a2a2a]" />
          <div className="mt-4 h-8 w-2/3 max-w-sm rounded-lg bg-[#eeeeee] dark:bg-[#2a2a2a]" />
          <div className="mt-2 h-4 w-40 rounded bg-[#f5f5f5] dark:bg-[#252525]" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-[#f5f5f5] dark:bg-[#252525]" />
            <div className="h-4 w-5/6 rounded bg-[#f5f5f5] dark:bg-[#252525]" />
            <div className="h-4 w-4/6 rounded bg-[#f5f5f5] dark:bg-[#252525]" />
          </div>
        </div>
      ))}
    </div>
  );
}
