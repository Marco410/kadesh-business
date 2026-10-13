import Image from "next/image";
import { HeroRadar } from "kadesh/components/home/HeroMapBackdrop";

/**
 * Demo animada de la extracción (WebP animado). Server Component: no mete framer-motion en el LCP.
 * `unoptimized`: el optimizador de Next no conserva la animación de un WebP.
 */
export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
      <HeroRadar />
      <div className="absolute -inset-6 rounded-[2rem] bg-orange-400/25 dark:bg-orange-500/15 blur-3xl" />
      <Image
        src="/images/demo/hero-extraccion.webp"
        alt="Demo de Kadesh: se elige una categoría en el mapa, se busca en un radio y aparecen los negocios encontrados con teléfono y rating"
        width={640}
        height={800}
        priority
        unoptimized
        sizes="(min-width: 1024px) 32rem, (min-width: 640px) 28rem, 100vw"
        className="relative mx-auto h-auto w-full max-w-sm sm:max-w-md"
      />
    </div>
  );
}
