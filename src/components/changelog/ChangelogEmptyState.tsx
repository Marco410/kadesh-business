import { HugeiconsIcon } from "@hugeicons/react";
import { FileNotFoundIcon } from "@hugeicons/core-free-icons";

export default function ChangelogEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-dash-line bg-dash-surface px-6 py-16 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400">
        <HugeiconsIcon icon={FileNotFoundIcon} size={28} />
      </span>
      <h2 className="text-lg font-bold text-dash-ink">
        Aún no hay novedades publicadas
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-dash-muted">
        Cuando publiquemos una nueva versión de KADESH Negocios, aparecerá aquí
        con el detalle de mejoras y correcciones.
      </p>
    </div>
  );
}
