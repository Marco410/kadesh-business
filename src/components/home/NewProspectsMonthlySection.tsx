"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

const MONTHS = [
  { month: "Mes 1", count: "400 negocios" },
  { month: "Mes 2", count: "400 nuevos negocios" },
  { month: "Mes 6", count: "+2400 prospectos totales" },
];

export default function NewProspectsMonthlySection() {
  return (
    <section
      id="nuevos-prospectos"
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
            Nuevos prospectos cada mes
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            Tu cuota mensual se renueva automáticamente, permitiéndote encontrar
            nuevos negocios cada mes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
        >
          {MONTHS.map((item, i) => (
            <div
              key={item.month}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-6 text-center"
            >
              <span className="inline-flex w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 items-center justify-center mx-auto mb-4">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={24}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <p className="font-bold text-[#212121] dark:text-white text-lg mb-1">
                {item.month}
              </p>
              <p className="text-[#616161] dark:text-[#b0b0b0] font-medium">
                {item.count}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-xl font-semibold text-[#212121] dark:text-white"
        >
          Nunca te quedas sin prospectos para contactar.
        </motion.p>
      </div>
    </section>
  );
}
