"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Shield01Icon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

const BENEFITS = [
  {
    icon: Clock01Icon,
    title: "Ahorra tiempo y dinero",
    description:
      "Genera listas de prospectos reales en minutos, sin anuncios caros ni semanas construyendo bases de datos a mano.",
  },
  {
    icon: Shield01Icon,
    title: "Datos públicos y legales",
    description:
      "Extraemos información pública de Google Maps para prospección B2B legítima. Sin bots, sin riesgo para tu cuenta.",
  },
  {
    icon: KanbanIcon,
    title: "CRM integrado de punta a punta",
    description:
      "Desde el primer lead hasta el cierre: pipeline, calendario, cotizaciones, vendedores y seguimiento en un solo lugar.",
  },
];

export default function WhyKadeshSection() {
  return (
    <section
      id="por-que-kadesh"
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400 mb-3">
            Por qué KADESH
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Haz más con una solución integral
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            No es solo una herramienta de extracción: es tu sistema completo para
            encontrar, contactar y cerrar clientes B2B.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {BENEFITS.map((benefit, i) => (
            <motion.article
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-6 sm:p-8 hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors"
            >
              <span className="inline-flex w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 items-center justify-center mb-5">
                <HugeiconsIcon
                  icon={benefit.icon}
                  size={28}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <h3 className="text-xl font-bold text-[#212121] dark:text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                {benefit.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
