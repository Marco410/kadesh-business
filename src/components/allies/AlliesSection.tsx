"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ALLIES,
  ALLY_CATEGORY_LABEL,
} from "kadesh/components/allies/constants";

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
            Ecosistema y aliados
          </p>
          <h2
            id="aliados-heading"
            className="mb-4 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
          >
            La familia Kadesh y quienes impulsan el B2B
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#616161] dark:text-[#b0b0b0]">
            Kadesh Pet y Kadesh FOOD son productos de la misma familia. Con
            agencias como Bosco Agency compartimos una visión: marketing con
            estructura, ventas con sistema y crecimiento sin caos.
          </p>
        </motion.header>

        <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {ALLIES.map((ally, index) => (
            <motion.li
              key={ally.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="h-full"
            >
              <a
                href={ally.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col items-center rounded-2xl border border-[#e0e0e0] bg-[#f8f8f8] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-lg dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:hover:border-orange-500/40 sm:p-8"
                aria-label={`Visitar ${ally.name}`}
              >
                <span className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">
                  {ALLY_CATEGORY_LABEL[ally.category]}
                </span>
                <span className="mb-5 flex h-24 w-full items-center justify-center px-4 py-2">
                  {ally.lockupName ? (
                    <span className="flex items-center gap-3">
                      <Image
                        src={ally.logoSrc}
                        alt=""
                        width={48}
                        height={48}
                        className={`h-12 w-12 object-contain${ally.themeAdaptiveLogo ? " brightness-0 dark:invert" : ""}`}
                        aria-hidden
                      />
                      <span className="text-xl font-bold tracking-tight text-[#212121] dark:text-white">
                        {ally.lockupName}
                      </span>
                    </span>
                  ) : (
                    <Image
                      src={ally.logoSrc}
                      alt={ally.logoAlt}
                      width={220}
                      height={64}
                      className={`h-auto max-h-14 w-auto max-w-[220px] object-contain transition-transform duration-300 group-hover:scale-[1.02]${ally.themeAdaptiveLogo ? " brightness-0 dark:invert" : ""}`}
                    />
                  )}
                </span>
                <span className="text-center text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                  {ally.description}
                </span>
                <span className="mt-auto pt-4 text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-500 dark:text-orange-400">
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
