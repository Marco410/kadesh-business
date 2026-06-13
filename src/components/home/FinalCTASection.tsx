"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Routes } from "kadesh/core/routes";

export default function FinalCTASection() {
  return (
    <section
      id="cta-final"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white mb-4"
        >
          Construye y monetiza tu lista de prospectos B2B
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-lg text-[#616161] dark:text-[#b0b0b0] mb-8"
        >
          Crea tu cuenta en 30 segundos. 50 leads gratis · Sin tarjeta de
          crédito · 7 días de prueba.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={Routes.auth.register}
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d0d0d] transition-all duration-300"
          >
            Acceder ahora a KADESH
          </Link>
          <Link
            href="/#agendar-demo"
            className="inline-flex items-center justify-center px-8 py-4 text-[#212121] dark:text-white font-semibold text-lg rounded-2xl border border-[#e0e0e0] dark:border-[#333] hover:border-orange-400/60 transition-colors"
          >
            Agendar demo en vivo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
