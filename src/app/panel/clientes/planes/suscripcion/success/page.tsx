"use client";

import Link from "next/link";
import PanelShell from "kadesh/components/panel/PanelShell";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function SuscripcionSuccessPage() {
  return (
    <PanelShell selectedTab="planes" title="Suscripción activada">
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="rounded-3xl border border-dash-line bg-dash-surface p-8 shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/15 dark:bg-green-500/20 text-green-600 dark:text-green-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-dash-ink">
            Suscripción activada
          </h1>
          <p className="mt-2 text-dash-muted">
            Tu plan ha sido activado correctamente. Ya puedes usar todas las funciones incluidas.
          </p>
          <Link
            href={`${Routes.panel}?tab=clientes`}
            className="mt-8 inline-block w-full rounded-full dash-grad-accent px-6 py-3 text-center text-sm font-semibold text-white hover:shadow-dash-accent-lift shadow-dash-accent"
          >
            Ir a Clientes
          </Link>
          <Link
            href={Routes.panelPlans}
            className="mt-3 inline-block w-full rounded-xl border-2 border-dash-line px-6 py-3 text-center text-sm font-semibold text-dash-ink dark:text-[#e0e0e0] hover:bg-dash-hover"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </PanelShell>
  );
}
