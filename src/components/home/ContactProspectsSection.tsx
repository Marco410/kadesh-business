"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CallIcon,
  Location01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

const MOCK_BUSINESS = {
  name: "Dental Care CDMX",
  phone: "+52 55 1234 5678",
};

export default function ContactProspectsSection() {
  return (
    <section
      id="contacto-inmediato"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 dark:bg-green-500/10 px-4 py-1.5 mb-6">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={18}
              className="text-green-600 dark:text-green-400"
            />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Contacto inmediato
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Contacta prospectos en segundos
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            Cada negocio incluye su teléfono listo para llamar y un enlace
            directo a Google Maps para que puedas ver su ubicación o abrir la
            ficha completa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-md mx-auto"
        >
          <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[#616161] dark:text-[#b0b0b0] mb-2">
              Ejemplo de lead
            </p>
            <h3 className="font-bold text-lg text-[#212121] dark:text-white mb-4">
              {MOCK_BUSINESS.name}
            </h3>
            <p className="text-[#616161] dark:text-[#b0b0b0] text-sm mb-4 flex items-center gap-2">
              <HugeiconsIcon icon={CallIcon} size={16} className="shrink-0" />
              {MOCK_BUSINESS.phone}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#252525] px-4 py-2.5 text-sm font-medium text-[#212121] dark:text-white">
                <HugeiconsIcon icon={CallIcon} size={18} className="text-green-600 dark:text-green-400" />
                Llamar
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 dark:bg-orange-500/10 px-4 py-2.5 text-sm font-medium text-orange-700 dark:text-orange-200">
                <HugeiconsIcon icon={Location01Icon} size={18} className="text-orange-500 dark:text-orange-400" />
                Ver en Google Maps
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
