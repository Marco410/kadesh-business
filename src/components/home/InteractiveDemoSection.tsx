"use client";

import { motion } from "framer-motion";
import DemoPlayer from "kadesh/components/home/interactive-demo/DemoPlayer";

export default function InteractiveDemoSection() {
  return (
    <section
      id="demo"
      className="relative py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400 text-center mb-3"
        >
          ¿Cómo funciona?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-center text-[#212121] dark:text-white mb-4"
        >
          Lanza tu búsqueda. Encuentra clientes. En un instante.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto mb-8"
        >
          Cuatro pasos: elige ubicación, categoría y radio. Los leads se extraen
          en tiempo real y quedan listos en tu CRM.
        </motion.p>

        <motion.ol
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-12"
        >
          {[
            { step: "1", label: "Elige ubicación en el mapa" },
            { step: "2", label: "Selecciona categoría" },
            { step: "3", label: "Define el radio de búsqueda" },
            { step: "4", label: "Descarga leads a tu CRM" },
          ].map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] px-4 py-3 text-center"
            >
              <span className="block text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                Paso #{item.step}
              </span>
              <span className="text-sm font-medium text-[#212121] dark:text-white">
                {item.label}
              </span>
            </li>
          ))}
        </motion.ol>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <DemoPlayer />
        </motion.div>
      </div>
    </section>
  );
}
