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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xl sm:text-2xl font-bold text-white">
          Ideal para Agencias, Freelancers y Equipos de Ventas B2B
        </p>
      </div>
    </motion.section>
  );
}
