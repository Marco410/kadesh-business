"use client";

import { useId } from "react";

export interface HiddenInWorkspaceSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function HiddenInWorkspaceSwitch({
  checked,
  onCheckedChange,
  disabled = false,
}: HiddenInWorkspaceSwitchProps) {
  const labelId = useId();
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#252525] px-4 py-3">
      <div className="min-w-0 pr-2">
        <p id={labelId} className="text-sm font-medium text-[#212121] dark:text-white">
          Ocultar en este espacio
        </p>
        <p className="mt-0.5 text-xs text-[#616161] dark:text-[#9e9e9e]">
          El registro no se muestra en el tablero de este workspace; sigue visible en
          el lead y en vista general.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-labelledby={labelId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-orange-500" : "bg-[#e0e0e0] dark:bg-[#525252]"
        }`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute top-0.5 left-0.5 inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
