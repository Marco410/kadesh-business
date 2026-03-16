"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

const BADGES = [
  "Leads únicos",
  "Nuevos leads cada mes",
  "Datos reales de negocios",
  "CRM integrado para seguimiento",
];

export default function HeroDifferentiatorsBadges() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="py-8 sm:py-10 bg-white dark:bg-[#0d0d0d] border-b border-[#e5e5e5] dark:border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {BADGES.map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-white/10 bg-[#f8f8f8] dark:bg-white/5 px-4 py-2.5"
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={18}
                className="text-green-600 dark:text-green-400 shrink-0"
              />
              <span className="text-sm font-medium text-[#212121] dark:text-white/90">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
