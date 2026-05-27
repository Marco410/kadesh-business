"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Radar01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

export default function ExtraccionB2BExampleSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white">
          Extracción B2B
        </h2>
        <p className="mt-1 text-[#616161] dark:text-[#b0b0b0]">
          Explora zonas en el mapa y sincroniza negocios como leads para tu CRM.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden shadow-sm">
        <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-4 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/10 dark:from-orange-500/10 dark:to-transparent p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 dark:bg-orange-500/25 text-orange-500 dark:text-orange-400">
            <HugeiconsIcon icon={Radar01Icon} size={32} aria-hidden />
          </div>
          <div className="max-w-md space-y-2">
            <p className="text-lg font-semibold text-[#212121] dark:text-white">
              Vista de ejemplo
            </p>
            <p className="text-sm text-[#616161] dark:text-[#9e9e9e]">
              Aquí irá el motor de exploración con mapa, filtros por categoría y
              sincronización de leads desde Google Maps.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            Próximamente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a] p-6">
          {[
            {
              icon: Location01Icon,
              title: "Zona en el mapa",
              description: "Define el área geográfica donde buscar prospectos.",
            },
            {
              icon: Search01Icon,
              title: "Filtros B2B",
              description: "Refina por categoría, rating y tipo de negocio.",
            },
            {
              icon: Radar01Icon,
              title: "Sincronizar leads",
              description: "Importa contactos directo a tu pipeline de ventas.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-4"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400">
                <HugeiconsIcon icon={step.icon} size={20} aria-hidden />
              </span>
              <p className="font-medium text-[#212121] dark:text-white">{step.title}</p>
              <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
