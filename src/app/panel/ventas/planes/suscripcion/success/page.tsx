"use client";

import Link from "next/link";
import { Footer, Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function SuscripcionSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-16 pt-28 text-center">
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-8 shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/15 dark:bg-green-500/20 text-green-600 dark:text-green-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
            Suscripción activada
          </h1>
          <p className="mt-2 text-[#616161] dark:text-[#b0b0b0]">
            Tu plan ha sido activado correctamente. Ya puedes usar todas las funciones incluidas.
          </p>
          <Link
            href={`${Routes.panel}?tab=ventas`}
            className="mt-8 inline-block w-full rounded-xl bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            Ir a Ventas
          </Link>
          <Link
            href={Routes.panelPlans}
            className="mt-3 inline-block w-full rounded-xl border-2 border-[#e0e0e0] dark:border-[#3a3a3a] px-6 py-3 text-center text-sm font-semibold text-[#212121] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
          >
            Ver planes
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
