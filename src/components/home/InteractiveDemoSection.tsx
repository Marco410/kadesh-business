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
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center text-[#212121] dark:text-white mb-4"
        >
          Así funciona
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto mb-12"
        >
          Elige un punto en el mapa, una categoría y el radio. Los leads se extraen en tiempo
          real desde Google Maps y quedan listos en tu CRM para comenzar a vender.
        </motion.p>

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
