"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

const MOCK_DATA = {
  rating: 4.8,
  reviewCount: "124 reseñas",
};

export default function GoogleMapsDataSection() {
  return (
    <section
      id="datos-google-maps"
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
            Datos reales de Google Maps
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            Cada negocio incluye información pública como calificación y número
            de reseñas para ayudarte a identificar mejores oportunidades.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] px-6 py-5 min-w-[180px]">
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center">
              <HugeiconsIcon
                icon={StarIcon}
                size={26}
                className="text-amber-500 dark:text-amber-400"
              />
            </span>
            <div>
              <p className="font-bold text-[#212121] dark:text-white text-lg">
                {MOCK_DATA.rating}
              </p>
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Rating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] px-6 py-5 min-w-[180px]">
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-lg">
              💬
            </span>
            <div>
              <p className="font-bold text-[#212121] dark:text-white text-lg">
                {MOCK_DATA.reviewCount}
              </p>
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Reseñas
              </p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-sm text-[#616161] dark:text-[#b0b0b0] mt-8"
        >
          Los datos provienen de información pública disponible en Google Maps.
        </motion.p>
      </div>
    </section>
  );
}
