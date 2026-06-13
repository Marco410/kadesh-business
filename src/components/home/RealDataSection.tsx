"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  StarIcon,
  CallIcon,
  Location01Icon,
  Tag01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { LANDING_SECTION_IMAGES } from "kadesh/components/home/constants";

const DATA_POINTS = [
  {
    icon: StarIcon,
    label: "Rating y reseñas",
    description: "Valoración real de Google para priorizar mejores oportunidades.",
  },
  {
    icon: CallIcon,
    label: "Teléfono verificado",
    description: "Números de contacto listos para llamar o enviar WhatsApp.",
  },
  {
    icon: Location01Icon,
    label: "Ubicación exacta",
    description: "Dirección, ciudad y enlace directo a Google Maps.",
  },
  {
    icon: Tag01Icon,
    label: "Categoría del negocio",
    description: "Segmenta por giro: restaurantes, clínicas, abogados y más.",
  },
];

export default function RealDataSection() {
  return (
    <section
      id="datos-reales"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 mb-6">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={18}
                className="text-green-600 dark:text-green-400"
              />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Datos en tiempo real
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
              Datos reales de Google Maps, listos para vender
            </h2>
            <p className="text-[#616161] dark:text-[#b0b0b0] text-lg mb-8 leading-relaxed">
              Cada negocio incluye teléfono, dirección, categoría, rating y
              reseñas. Contacta en segundos sin buscar manualmente en el mapa.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {DATA_POINTS.map((point, i) => (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="rounded-xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HugeiconsIcon
                      icon={point.icon}
                      size={18}
                      className="text-orange-500 dark:text-orange-400"
                    />
                    <span className="font-semibold text-[#212121] dark:text-white text-sm">
                      {point.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                    {point.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-orange-500/10 dark:bg-orange-500/5 blur-2xl" />
            <div className="relative rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] overflow-hidden shadow-xl">
              <Image
                src={LANDING_SECTION_IMAGES.leadDetail}
                alt="Ficha de lead con datos de Google Maps, redes sociales y seguimiento de ventas en KADESH"
                width={1200}
                height={800}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
