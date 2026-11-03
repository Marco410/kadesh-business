"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { KanbanIcon, LeftToRightListDashIcon } from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";

export type LeadsView = "list" | "board";

export default function LeadsViewToggle({
  view,
  onChange,
}: {
  view: LeadsView;
  onChange: (view: LeadsView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Forma de ver los clientes"
      data-tour="clientes-vista"
      className="inline-flex w-full rounded-xl border border-dash-line bg-dash-surface-2 p-1 dark:bg-[#161616] sm:w-auto"
    >
      <ViewButton
        active={view === "list"}
        label="Lista"
        icon={LeftToRightListDashIcon}
        onClick={() => onChange("list")}
      />
      <ViewButton
        active={view === "board"}
        label="Tablero"
        icon={KanbanIcon}
        onClick={() => onChange("board")}
      />
    </div>
  );
}

function ViewButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof KanbanIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors sm:flex-none sm:px-4",
        active
          ? "bg-white text-dash-ink shadow-sm dark:bg-[#2a2a2a]"
          : "text-dash-muted hover:text-dash-ink",
      )}
    >
      <HugeiconsIcon icon={icon} size={18} />
      {label}
    </button>
  );
}
