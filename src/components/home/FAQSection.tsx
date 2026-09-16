"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { FAQ_ITEMS } from "kadesh/components/home/faq-items";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Preguntas frecuentes sobre extraer leads de Google Maps e INEGI
          </h2>
          <p className="text-[#424242] dark:text-[#d6d6d6] max-w-2xl mx-auto">
            Respuestas directas sobre legalidad, duplicados, CRM, Kadesh AI,
            precios y países donde Kadesh puede prospectar negocios B2B.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <article
                key={item.question}
                className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] overflow-hidden"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#212121] dark:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#252525] transition-colors duration-150"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span>{item.question}</span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={18}
                        className="text-orange-500 dark:text-orange-400"
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 pt-3 text-[#616161] dark:text-[#b0b0b0] text-sm sm:text-base leading-relaxed border-t border-[#e0e0e0] dark:border-[#2a2a2a]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
