"use client";

import { motion } from "framer-motion";
import ProductDemoCard from "kadesh/components/shared/ProductDemoCard";

export default function AuthPageVisual() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#0d0d0d]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mb-8 max-w-sm px-8 text-center"
      >
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Leads B2B desde Google Maps
        </h1>
        <p className="mt-2 text-sm text-white/80 sm:text-base">
          Elige ubicación, categoría y radio. Los datos se sincronizan con tu CRM.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 pb-10 sm:px-8"
      >
        <div className="absolute -inset-4 rounded-[2rem] bg-white/10 blur-2xl dark:bg-orange-500/10" />
        <ProductDemoCard />
      </motion.div>
    </div>
  );
}
