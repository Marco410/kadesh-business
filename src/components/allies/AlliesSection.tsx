"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ALLIES } from "kadesh/components/allies/constants";

export default function AlliesSection() {
  return (
    <section
      id="aliados"
      aria-labelledby="aliados-heading"
      className="bg-white py-16 dark:bg-[#121212] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
            Aliados estratégicos
          </p>
          <h2
            id="aliados-heading"
            className="mb-4 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
          >
            Crecemos junto a equipos que impulsan el B2B
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#616161] dark:text-[#b0b0b0]">
            Colaboramos con agencias y consultoras que comparten nuestra visión:
            marketing con estructura, ventas con sistema y crecimiento sin caos.
          </p>
        </motion.header>

        <ul className="mx-auto flex max-w-4xl flex-wrap items-stretch justify-center gap-6">
          {ALLIES.map((ally, index) => (
            <motion.li
              key={ally.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="w-full sm:w-auto"
            >
              <a
                href={ally.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col items-center rounded-2xl border border-[#e0e0e0] bg-[#f8f8f8] p-6 transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:hover:border-orange-500/40 sm:min-w-[280px] sm:p-8"
                aria-label={`Visitar sitio web de ${ally.name}`}
              >
                <span className="mb-5 flex h-24 w-full items-center justify-center px-4 py-2">
                  <Image
                    src={ally.logoSrc}
                    alt={ally.logoAlt}
                    width={220}
                    height={64}
                    className={`h-auto max-h-14 w-auto max-w-[220px] object-contain transition-transform duration-300 group-hover:scale-[1.02]${ally.themeAdaptiveLogo ? " brightness-0 dark:invert" : ""}`}
                  />
                </span>
                {/* <span className="mb-1 text-center text-lg font-bold text-[#212121] dark:text-white">
                  {ally.name}
                </span> */}
                <span className="text-center text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                  {ally.description}
                </span>
                <span className="mt-4 text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-500 dark:text-orange-400">
                  Conocer más →
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
