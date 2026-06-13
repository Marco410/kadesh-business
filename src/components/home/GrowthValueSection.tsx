"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Chart01Icon, Calendar03Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";

const GROWTH_STEPS = [
  { month: "Mes 1", count: "400 negocios nuevos", detail: "Tu cuota mensual se activa" },
  { month: "Mes 2", count: "400 negocios más", detail: "Sin duplicados, solo leads frescos" },
  { month: "Mes 6", count: "+2,400 prospectos", detail: "Base sólida para tu equipo" },
];

const ROI_STEPS = [
  { value: "400 leads mensuales", label: "Tu cuota con plan Pro" },
  { value: "20 negocios contactados", label: "Si contactas solo el 5%" },
  { value: "1 cliente nuevo", label: "Puede cubrir muchas veces el costo del plan" },
];

export default function GrowthValueSection() {
  return (
    <section
      id="crece-con-kadesh"
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
            Nunca te quedas sin prospectos para contactar
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            Tu cuota se renueva cada mes y el sistema evita duplicados. Un solo
            cliente nuevo puede pagar meses de suscripción.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={24}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <h3 className="text-xl font-bold text-[#212121] dark:text-white">
                Crecimiento mensual automático
              </h3>
            </div>
            <div className="space-y-4">
              {GROWTH_STEPS.map((step) => (
                <div
                  key={step.month}
                  className="rounded-xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] px-5 py-4"
                >
                  <p className="font-bold text-[#212121] dark:text-white">
                    {step.month}: {step.count}
                  </p>
                  <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Chart01Icon}
                  size={24}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <h3 className="text-xl font-bold text-[#212121] dark:text-white">
                ROI que se paga solo
              </h3>
            </div>
            <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] p-6">
              <ul className="space-y-4">
                {ROI_STEPS.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#9ca3af]">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center mt-12"
        >
          <Link
            href={Routes.auth.register}
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
          >
            Comenzar a generar leads
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
