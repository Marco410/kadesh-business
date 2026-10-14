"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Tag01Icon,
  Radar01Icon,
  DatabaseImportIcon,
} from "@hugeicons/core-free-icons";
import DemoPlayer from "kadesh/components/home/interactive-demo/DemoPlayer";
import { SECTION_QUESTION_CLASS } from "kadesh/components/home/landing-cta";

const STEPS = [
  { icon: Location01Icon, label: "Elige ubicación en el mapa" },
  { icon: Tag01Icon, label: "Selecciona categoría" },
  { icon: Radar01Icon, label: "Define el radio de búsqueda" },
  { icon: DatabaseImportIcon, label: "Descarga leads a tu CRM" },
] as const;

/**
 * Segunda parada después de las cifras: ver el producto funcionando. Pasos como línea conectada
 * (no cajas sueltas) y la demo enmarcada con brillo naranja para que pese visualmente.
 */
export default function InteractiveDemoSection() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden py-16 sm:py-24 bg-white dark:bg-[#121212] scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/10"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className={`${SECTION_QUESTION_CLASS} text-center`}>
          ¿Cuánto tarda extraer una lista de prospectos?
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-[#212121] dark:text-white mb-4 tracking-tight">
          Tu primera lista en menos de un minuto, sin instalar nada
        </h2>
        <p className="text-center text-lg text-[#424242] dark:text-[#d6d6d6] max-w-2xl mx-auto mb-10 leading-relaxed">
          <strong className="font-semibold text-[#212121] dark:text-white">Menos de un minuto.</strong>{" "}
          Eliges ubicación, categoría y radio; Kadesh extrae los negocios en
          tiempo real y los deja en el CRM. La demo de abajo recorre esos
          cuatro pasos sin crear una cuenta.
        </p>

        <ol className="relative mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          <span
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 lg:block"
            aria-hidden
          />
          {STEPS.map((item, i) => (
            <li key={item.label} className="relative flex flex-col items-center text-center">
              <span className="relative mb-3 flex size-10 items-center justify-center rounded-full bg-orange-800 text-white shadow-[0_8px_20px_rgba(168,86,31,0.35)] ring-4 ring-white dark:ring-[#121212]">
                <HugeiconsIcon icon={item.icon} size={18} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">
                Paso {i + 1}
              </span>
              <span className="mt-0.5 text-sm font-medium text-[#212121] dark:text-white">
                {item.label}
              </span>
            </li>
          ))}
        </ol>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="relative mx-auto max-w-6xl"
        >
          <div
            className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-orange-500/30 via-orange-400/10 to-transparent blur-xl"
            aria-hidden
          />
          <div className="relative">
            <DemoPlayer />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
