"use client";

import { motion } from "framer-motion";

export default function SocialProofBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="py-12 sm:py-16 bg-orange-500 dark:bg-orange-600"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80 mb-3">
          Confían en KADESH
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
          Agencias, freelancers y equipos de ventas B2B en México
        </p>
        <p className="text-white/85 text-base sm:text-lg">
          Desde prospección local hasta operaciones con miles de leads y
          múltiples vendedores.
        </p>
      </div>
    </motion.section>
  );
}
