"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  StarIcon,
  CallIcon,
  Tag01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

const BADGES = [
  {
    icon: StarIcon,
    label: "Rating",
    description: "Valoración real de Google para priorizar prospectos.",
  },
  {
    icon: CallIcon,
    label: "Teléfono Verificado",
    description: "Números de contacto verificados desde Google Maps.",
  },
  {
    icon: Tag01Icon,
    label: "Categoría",
    description: "Segmenta por sector: abogados, dentistas, bares y más.",
  },
];

export default function PowerOfDataSection() {
  return (
    <section
      id="datos"
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
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            El poder de los datos reales
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto">
            Toda la información viene directamente de Google: actualizada y lista para tu CRM.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] px-6 py-5 max-w-sm"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={badge.icon}
                  size={22}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#212121] dark:text-white">
                    {badge.label}
                  </span>
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={16}
                    className="text-green-500"
                    aria-hidden
                  />
                </div>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
