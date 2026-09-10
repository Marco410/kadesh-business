"use client";

import ProductDemoCard from "kadesh/components/shared/ProductDemoCard";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
      <div className="absolute -inset-6 rounded-[2rem] bg-orange-400/25 dark:bg-orange-500/15 blur-3xl" />
      <ProductDemoCard />
    </div>
  );
}
