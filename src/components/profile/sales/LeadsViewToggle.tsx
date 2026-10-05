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
      className="inline-flex w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] p-1 dark:border-[#3a3a3a] dark:bg-[#161616] sm:w-auto"
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
          ? "bg-white text-[#212121] shadow-sm dark:bg-[#2a2a2a] dark:text-white"
          : "text-[#616161] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:text-white",
      )}
    >
      <HugeiconsIcon icon={icon} size={18} />
      {label}
    </button>
  );
}
