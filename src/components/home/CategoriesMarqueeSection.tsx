"use client";

import { motion } from "framer-motion";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/components/profile/sales/constants";

const baseCategories = GOOGLE_PLACE_CATEGORIES.filter(category => category.value !== "otra");
const categoriesRowA = [...baseCategories, ...baseCategories];
const categoriesRowB = [...baseCategories.slice(Math.floor(baseCategories.length / 2)), ...baseCategories];

export default function CategoriesMarqueeSection() {
  return (
    <section className="py-5 sm:py-10 bg-[#050505] dark:bg-[#050505] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-400 mb-1">
              Categorías de negocios
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              ¿Necesitas clientes de estos giros?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#b0b0b0]">
              Elige un giro en el mapa y genera listas de prospectos listos para contactar.
            </p>
          </div>

          <div className="relative w-full overflow-hidden space-y-2">
            <motion.div
              className="flex gap-2 sm:gap-3 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            >
              {categoriesRowA.map((cat, index) => (
                <span
                  key={`rowA-${cat.value}-${index}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-xs sm:text-sm text-orange-100 hover:bg-orange-500/20 transition-colors"
                >
                  {cat.label}
                </span>
              ))}
            </motion.div>
            <motion.div
              className="flex gap-3 sm:gap-4 whitespace-nowrap"
              animate={{ x: ["-25%", "-75%"] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              {categoriesRowB.map((cat, index) => (
                <span
                  key={`rowB-${cat.value}-${index}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-orange-500/35 bg-orange-500/5 text-xs sm:text-sm text-orange-100/90 hover:bg-orange-500/15 transition-colors"
                >
                  {cat.label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

