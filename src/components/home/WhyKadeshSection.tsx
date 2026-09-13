"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Shield01Icon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

const SECONDARY = [
  {
    icon: Shield01Icon,
    title: "Datos públicos y legales",
    description:
      "Extraemos información pública de Google Maps para prospección B2B legítima. Sin bots y sin riesgo para tu cuenta personal.",
  },
  {
    icon: KanbanIcon,
    title: "CRM de punta a punta",
    description:
      "Desde el primer lead hasta el cierre: pipeline, calendario, cotizaciones, vendedores y seguimiento en un solo lugar.",
  },
] as const;

export default function WhyKadeshSection() {
  return (
    <section
      id="por-que-kadesh"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-5 tracking-tight">
              ¿Por qué usar Kadesh para conseguir clientes B2B?
            </h2>
            <p className="text-lg text-[#424242] dark:text-[#d6d6d6] leading-relaxed mb-8">
              Kadesh no es solo un extractor de Google Maps: genera listas de
              prospectos reales en minutos, con teléfono y rating, y las
              gestiona en un CRM. Evitas anuncios caros y semanas armando bases
              a mano; un flujo cubre búsqueda, contacto y cierre.
            </p>
            <div className="rounded-3xl bg-orange-500 text-white p-7 sm:p-8 shadow-[0_18px_40px_rgba(231,124,58,0.28)]">
              <span className="inline-flex w-12 h-12 rounded-2xl bg-white/15 items-center justify-center mb-4">
                <HugeiconsIcon icon={Clock01Icon} size={26} />
              </span>
              <h3 className="text-2xl font-bold mb-3">Ahorra tiempo y dinero</h3>
              <p className="text-white/90 leading-relaxed">
                Genera listas de prospectos reales en minutos, sin anuncios
                caros ni semanas construyendo bases de datos a mano. Con el
                plan Pro el costo por lead queda en unos 1.60 MXN.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-5">
            {SECONDARY.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#e8e8e8] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-6 sm:p-8"
              >
                <span className="inline-flex w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 items-center justify-center mb-4">
                  <HugeiconsIcon
                    icon={item.icon}
                    size={24}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </span>
                <h3 className="text-xl font-bold text-[#212121] dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
