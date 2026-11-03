"use client";

import Link from "next/link";
import PanelShell from "kadesh/components/panel/PanelShell";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function CompraCreditosSuccessPage() {
  return (
    <PanelShell selectedTab="creditos" title="Compra lista">
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="rounded-3xl border border-dash-line bg-dash-surface p-8 shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-dash-ink">
            Compra confirmada
          </h1>
          <p className="mt-2 text-dash-muted">
            Tus créditos extra ya están disponibles. Puedes seguir extrayendo
            leads desde el panel.
          </p>
          <Link
            href={Routes.panel}
            className="mt-8 inline-block w-full rounded-full dash-grad-accent px-6 py-3 text-center text-sm font-semibold text-white hover:shadow-dash-accent-lift shadow-dash-accent"
          >
            Ir al panel
          </Link>
          <Link
            href={Routes.panelCredits}
            className="mt-3 inline-block w-full rounded-xl border-2 border-dash-line px-6 py-3 text-center text-sm font-semibold text-dash-ink transition-colors hover:bg-dash-hover dark:text-[#e0e0e0]"
          >
            Ver paquetes
          </Link>
        </div>
      </div>
    </PanelShell>
  );
}
