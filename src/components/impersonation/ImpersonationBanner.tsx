"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon } from "@hugeicons/core-free-icons";
import { useIsClient } from "kadesh/utils/useIsClient";
import { finishImpersonation, readImpersonation } from "./session";

const CHECK_EVERY_MS = 30_000;

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Barra fija mientras un admin de Kadesh ve el panel como otra persona. Dice a quién, que es
 * solo lectura y hasta qué hora; al vencer la hora sale sola.
 */
export default function ImpersonationBanner() {
  // localStorage solo existe en el cliente: en el render del servidor no hay barra.
  const isClient = useIsClient();
  const info = useMemo(() => (isClient ? readImpersonation() : null), [isClient]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!info) return;
    const check = () => {
      if (Date.now() >= new Date(info.expiresAt).getTime()) void finishImpersonation();
    };
    check();
    const interval = window.setInterval(check, CHECK_EVERY_MS);
    return () => window.clearInterval(interval);
  }, [info]);

  if (!info) return null;

  const leave = async () => {
    setLeaving(true);
    await finishImpersonation();
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-amber-500/40 bg-amber-400 px-4 py-2.5 text-amber-950 shadow-[0_-4px_16px_rgba(0,0,0,0.15)] dark:bg-amber-500"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm">
          <HugeiconsIcon icon={ViewIcon} size={18} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Estás viendo el panel como <strong>{info.userName}</strong>
            {info.companyName ? ` (${info.companyName})` : ""}. Solo lectura, hasta las{" "}
            {timeLabel(info.expiresAt)}.
          </span>
        </p>
        <button
          type="button"
          onClick={leave}
          disabled={leaving}
          className="h-10 shrink-0 rounded-lg bg-amber-950 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-70 cursor-pointer"
        >
          {leaving ? "Saliendo…" : "Salir y volver a Operaciones"}
        </button>
      </div>
    </div>
  );
}
