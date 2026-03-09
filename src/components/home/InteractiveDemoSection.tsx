"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CallIcon, StarIcon } from "@hugeicons/core-free-icons";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/components/profile/sales/constants";

const MOCK_LEADS = [
  { name: "Bufete Legal García", phone: "+52 55 1234 5678", rating: 4.8, category: "Abogados" },
  { name: "Dental Care CDMX", phone: "+52 55 8765 4321", rating: 4.5, category: "Dentistas" },
  { name: "Bar La Esquina", phone: "+52 55 2345 6789", rating: 4.2, category: "Bares" },
];

export default function InteractiveDemoSection() {
  const [category, setCategory] = useState<string>(GOOGLE_PLACE_CATEGORIES[0].value);
  const [syncing, setSyncing] = useState(true);
  const [leadsVisible, setLeadsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSyncing(false);
      setLeadsVisible(true);
    }, 2800);
    return () => clearTimeout(t);
  }, []);

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
          Elige un punto en el mapa, una categoría y el radio. Los leads se extraen en tiempo real desde Google Maps.
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Map mock — sticky on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#1a1a1a] shadow-xl aspect-[4/3] min-h-[280px]">
              {/* Dark map-style background */}
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(30,30,30,0.97) 0%, transparent 50%),
                    repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(80,80,80,0.15) 24px, rgba(80,80,80,0.15) 25px),
                    repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(80,80,80,0.15) 24px, rgba(80,80,80,0.15) 25px)
                  `,
                }}
              />
              {/* Center pin + circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-orange-500/80 border-dashed"
                  style={{
                    boxShadow: "0 0 0 4px rgba(247, 148, 94, 0.2)",
                  }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-8 h-8 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                </div>
              </div>
              {/* Floating category selector */}
              <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-56">
                <label className="block text-xs font-medium text-[#b0b0b0] mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Categoría"
                >
                  {GOOGLE_PLACE_CATEGORIES.slice(0, 8).map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="absolute bottom-4 left-4 text-xs text-[#808080]">
                Radio: 5 km
              </div>
            </div>
          </motion.div>

          {/* Right: Sync state → leads list */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {syncing ? (
                <motion.div
                  key="syncing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] p-8 flex flex-col items-center justify-center min-h-[240px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent mb-4"
                  />
                  <p className="text-[#616161] dark:text-[#b0b0b0] font-medium">
                    Sincronizando...
                  </p>
                  <p className="text-sm text-[#9ca3af] dark:text-[#808080] mt-1">
                    Extrayendo datos de Google Maps
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="leads"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#e0e0e0] dark:border-[#2a2a2a] flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#212121] dark:text-white">
                      Leads encontrados
                    </span>
                    <span className="text-xs text-orange-500 font-medium">
                      {MOCK_LEADS.length} resultados
                    </span>
                  </div>
                  <ul className="divide-y divide-[#e5e7eb] dark:divide-[#2a2a2a] max-h-[280px] overflow-y-auto">
                    {MOCK_LEADS.map((lead, i) => (
                      <motion.li
                        key={lead.name}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="px-4 py-3 flex flex-col gap-1.5 hover:bg-[#f5f5f5] dark:hover:bg-[#252525] transition-colors"
                      >
                        <span className="font-medium text-[#212121] dark:text-white text-sm">
                          {lead.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 text-[#616161] dark:text-[#b0b0b0]">
                            <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500" />
                            {lead.rating}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#616161] dark:text-[#b0b0b0]">
                            <HugeiconsIcon icon={CallIcon} size={14} />
                            {lead.phone}
                          </span>
                          <span className="rounded bg-[#e5e7eb] dark:bg-[#3a3a3a] px-1.5 py-0.5 text-[#616161] dark:text-[#b0b0b0]">
                            {lead.category}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
