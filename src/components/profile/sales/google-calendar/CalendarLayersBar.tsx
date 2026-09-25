"use client";

export interface CalendarLayer {
  /** `activity` | `proposal` | `followup` | `native` o el id de un `GoogleCalendarSelection`. */
  key: string;
  label: string;
  /** Color hex de la capa (el de Google para calendarios; uno fijo para los de Kadesh). */
  color: string;
}

export interface CalendarLayerGroup {
  id: string;
  /** Encabezado del grupo (`Kadesh` o el correo de la cuenta de Google). */
  label: string;
  layers: CalendarLayer[];
}

interface CalendarLayersBarProps {
  groups: CalendarLayerGroup[];
  /** Claves de capas ocultas. Vacío = se ve todo. */
  hiddenKeys: Set<string>;
  onToggle: (key: string) => void;
  /** Muestra u oculta todas las capas de un grupo a la vez. */
  onToggleGroup: (groupId: string, show: boolean) => void;
}

function LayerCheckbox({
  layer,
  checked,
  onToggle,
}: {
  layer: CalendarLayer;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`inline-flex max-w-full cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        checked
          ? "border-[#e0e0e0] bg-white text-[#212121] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#ffffff]"
          : "border-dashed border-[#d0d0d0] text-[#9e9e9e] hover:text-[#616161] dark:border-[#444] dark:hover:text-[#b0b0b0]"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span
        aria-hidden
        className="flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
        style={{
          borderColor: layer.color,
          backgroundColor: checked ? layer.color : "transparent",
        }}
      >
        {checked ? (
          <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M2.5 6.2 5 8.7l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span className="truncate">{layer.label}</span>
    </label>
  );
}

/**
 * Capas visibles del calendario. Sustituye a la leyenda y al filtro: cada tipo de Kadesh y cada
 * calendario de Google es una casilla independiente (marcada = sus eventos se ven).
 */
export default function CalendarLayersBar({
  groups,
  hiddenKeys,
  onToggle,
  onToggleGroup,
}: CalendarLayersBarProps) {
  return (
    <div
      data-tour="calendar-filters"
      className="min-w-0 flex-1 space-y-2.5 rounded-xl border border-[#e0e0e0] bg-white p-3 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
    >
      {groups.map((group) => {
        const allShown = group.layers.every((l) => !hiddenKeys.has(l.key));
        return (
          <div key={group.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
            <div className="flex shrink-0 items-center gap-2 sm:w-48">
              <span
                className="max-w-full truncate text-[11px] font-semibold uppercase tracking-wide text-[#9e9e9e]"
                title={group.label}
              >
                {group.label}
              </span>
              {group.layers.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.id, !allShown)}
                  className="shrink-0 text-[11px] font-semibold text-orange-600 hover:underline dark:text-orange-400"
                >
                  {allShown ? "Ninguno" : "Todos"}
                </button>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {group.layers.map((layer) => (
                <LayerCheckbox
                  key={layer.key}
                  layer={layer}
                  checked={!hiddenKeys.has(layer.key)}
                  onToggle={() => onToggle(layer.key)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
