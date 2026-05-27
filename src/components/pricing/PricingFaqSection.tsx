"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { PRICING_FAQ_ITEMS } from "./constants";

export default function PricingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="preguntas-precios"
      aria-labelledby="pricing-faq-heading"
      className="py-16 sm:py-24 bg-[#f5f5f5] dark:bg-[#0a0a0a] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            id="pricing-faq-heading"
            className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4"
          >
            Preguntas sobre planes y precios
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto">
            Respuestas claras para equipos de ventas, agencias y consultores que
            evalúan KADESH en México.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          {PRICING_FAQ_ITEMS.map((item, index) => (
            <article
              key={item.question}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] overflow-hidden"
            >
              <h3 className="sr-only">{item.question}</h3>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#212121] dark:text-white hover:bg-[#f8f8f8] dark:hover:bg-[#252525] transition-colors"
                aria-expanded={openIndex === index}
              >
                <span>{item.question}</span>
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={18}
                    className="text-orange-500 dark:text-orange-400"
                  />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-[#616161] dark:text-[#b0b0b0] text-sm sm:text-base leading-relaxed border-t border-[#e0e0e0] dark:border-[#2a2a2a]">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
