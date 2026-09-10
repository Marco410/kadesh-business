"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Tick02Icon,
  Add01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const FLOW_STEPS = [
  {
    icon: Search01Icon,
    label: "Buscar negocios",
  },
  {
    icon: Tick02Icon,
    label: "Detectar duplicados automáticamente",
  },
  {
    icon: Add01Icon,
    label: "Agregar solo nuevos leads a tu cuenta",
  },
];

export default function UniqueLeadsSection() {
  return (
    <section
      id="leads-unicos"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            ¿Kadesh agrega el mismo negocio dos veces?
          </h2>
          <p className="text-[#424242] dark:text-[#d6d6d6] max-w-2xl mx-auto text-lg">
            No. Antes de guardar un negocio, Kadesh comprueba si ya está en tu
            cuenta. Si existe, no se vuelve a agregar ni consume tu cuota
            mensual, así cada ciclo suma prospectos nuevos y no duplicados.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 flex-wrap"
        >
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] px-5 py-4 min-w-[200px] sm:min-w-0">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={step.icon}
                    size={22}
                    className="text-orange-500 dark:text-orange-400"
                  />
                </span>
                <span className="font-medium text-[#212121] dark:text-white text-sm sm:text-base">
                  {step.label}
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <span className="hidden sm:flex flex-shrink-0 text-[#9ca3af] dark:text-[#6b7280]">
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
