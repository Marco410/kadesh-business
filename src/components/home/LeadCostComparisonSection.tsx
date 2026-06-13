"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Routes } from "kadesh/core/routes";

export default function LeadCostComparisonSection() {
  return (
    <section
      id="costo-leads"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-6 leading-tight">
            Diseña la audiencia ideal para tu negocio.{" "}
            <span className="text-orange-600 dark:text-orange-400">
              Precisa y segmentada.
            </span>
          </h2>
          <p className="text-lg text-[#616161] dark:text-[#b0b0b0] max-w-3xl mx-auto mb-8 leading-relaxed">
            ¿Cuánto te cuesta un lead en Meta Ads? ¿$150 MXN? ¿$300 MXN? Con
            KADESH obtienes prospectos reales desde{" "}
            <strong className="text-[#212121] dark:text-white">
              menos de $1 MXN por lead
            </strong>
            . Solo elige categoría, ciudad y radio en el mapa: en minutos tienes
            negocios con teléfono, dirección y rating listos para contactar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-6 py-4 text-center min-w-[200px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                Meta Ads
              </p>
              <p className="text-2xl font-black text-red-700 dark:text-red-300">
                $150–$300
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                por lead aprox.
              </p>
            </div>
            <span className="text-2xl font-bold text-[#9ca3af]">vs</span>
            <div className="rounded-2xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 px-6 py-4 text-center min-w-[200px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">
                KADESH
              </p>
              <p className="text-2xl font-black text-green-700 dark:text-green-300">
                &lt; $1 MXN
              </p>
              <p className="text-xs text-green-600/80 dark:text-green-400/80">
                por lead con plan Pro
              </p>
            </div>
          </div>

          <Link
            href={Routes.auth.register}
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d0d0d] transition-all duration-300"
          >
            Empieza gratis (50 leads incluidos)
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
