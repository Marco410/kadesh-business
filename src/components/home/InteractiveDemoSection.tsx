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
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#212121] dark:text-white mb-4">
          ¿Cuánto tarda extraer una lista de prospectos?
        </h2>
        <p className="text-center text-[#424242] dark:text-[#d6d6d6] max-w-2xl mx-auto mb-8 leading-relaxed">
          Menos de un minuto. Eliges ubicación, categoría y radio; Kadesh
          extrae los negocios en tiempo real y los deja en el CRM. La demo
          de abajo recorre esos cuatro pasos sin crear una cuenta.
        </p>

        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-12">
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
                Paso {item.step}
              </span>
              <span className="text-sm font-medium text-[#212121] dark:text-white">
                {item.label}
              </span>
            </li>
          ))}
        </ol>

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
