"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Chart01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

const ROI_STEPS = [
  { value: "400 leads mensuales", label: "Tu cuota" },
  { value: "20 negocios contactados", label: "Si contactas solo el 5%" },
  {
    value: "1 nuevo cliente",
    label: "Puede cubrir muchas veces el costo del plan",
  },
];

export default function ConvertProspectsSection() {
  return (
    <section
      id="convierte-prospectos"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
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
            Convierte prospectos en clientes
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto">
            El objetivo es ayudarte a entender el ROI: un solo cliente puede
            superar con creces el costo de tu plan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Chart01Icon}
                  size={26}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <span className="font-semibold text-[#212121] dark:text-white text-lg">
                Ejemplo con 400 leads mensuales
              </span>
            </div>
            <ul className="space-y-4">
              {ROI_STEPS.map((step, i) => (
                <li key={step.label} className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#9ca3af] dark:text-[#6b7280]">
                    {i > 0 ? (
                      <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    ) : null}
                  </span>
                  <div className="flex-1 rounded-xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#252525] px-4 py-3">
                    <p className="font-bold text-[#212121] dark:text-white">
                      {step.value}
                    </p>
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                      {step.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
