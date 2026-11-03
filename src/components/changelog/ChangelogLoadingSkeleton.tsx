export default function ChangelogLoadingSkeleton() {
  return (
    <div className="space-y-8 pl-10 sm:pl-12" aria-busy="true" aria-label="Cargando novedades">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-3xl border border-dash-line bg-dash-surface p-8"
        >
          <div className="h-6 w-24 rounded-lg bg-dash-surface-2" />
          <div className="mt-4 h-8 w-2/3 max-w-sm rounded-lg bg-dash-surface-2" />
          <div className="mt-2 h-4 w-40 rounded bg-dash-surface-2" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-dash-surface-2" />
            <div className="h-4 w-5/6 rounded bg-dash-surface-2" />
            <div className="h-4 w-4/6 rounded bg-dash-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
