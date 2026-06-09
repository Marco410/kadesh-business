"use client";

import Link from "next/link";
import { Footer, Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function CompraCreditosSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 py-16 pt-28 text-center sm:px-6">
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-8 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
            Compra confirmada
          </h1>
          <p className="mt-2 text-[#616161] dark:text-[#b0b0b0]">
            Tus créditos extra ya están disponibles. Puedes seguir extrayendo
            leads desde el panel.
          </p>
          <Link
            href={Routes.panel}
            className="mt-8 inline-block w-full rounded-xl bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            Ir al panel
          </Link>
          <Link
            href={Routes.panelCredits}
            className="mt-3 inline-block w-full rounded-xl border-2 border-[#e0e0e0] px-6 py-3 text-center text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
          >
            Ver paquetes
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
