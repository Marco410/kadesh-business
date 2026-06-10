"use client";

import { motion } from "framer-motion";
import ProductDemoCard from "kadesh/components/shared/ProductDemoCard";

export default function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto lg:max-w-lg"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-orange-400/25 dark:bg-orange-500/15 blur-3xl" />
      <ProductDemoCard />
    </motion.div>
  );
}
