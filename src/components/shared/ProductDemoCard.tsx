"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  StarIcon,
  Location01Icon,
  Search01Icon,
  CallIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";

export const PRODUCT_DEMO_LEADS = [
  { name: "Taquería El Matador", rating: 4.3, phone: "55 7293 5783" },
  { name: "Restaurante Los Compadres", rating: 4.6, phone: "55 5119 2840" },
  { name: "Izakaya Sushi", rating: 4.9, phone: "55 6274 1092" },
] as const;

const MAP_PINS = [
  { top: "28%", left: "22%", delay: 0.8 },
  { top: "42%", left: "68%", delay: 1.1 },
  { top: "58%", left: "38%", delay: 1.4 },
] as const;

export type ProductDemoCardProps = {
  className?: string;
  animated?: boolean;
  showLiveBadge?: boolean;
  showSuccessToast?: boolean;
};

export default function ProductDemoCard({
  className,
  animated = true,
  showLiveBadge = true,
  showSuccessToast = true,
}: ProductDemoCardProps) {
  const MotionWrap = animated ? motion.div : "div";
  const motionProps = animated
    ? {
        animate: { y: [0, -6, 0] as number[] },
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};

  const fadeIn = (delay: number, extra?: Record<string, unknown>) =>
    animated
      ? {
          initial: { opacity: 0, ...(extra?.initial as object) },
          animate: { opacity: 1, ...(extra?.animate as object) },
          transition: { delay, ...(extra?.transition as object) },
        }
      : {};

  return (
    <MotionWrap className={cn("relative", className)} {...motionProps}>
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-2xl shadow-black/10 backdrop-blur-md dark:border-white/15 dark:bg-[#141414]/95 dark:shadow-black/40">
        <div className="relative h-48 sm:h-56 bg-[#e8e4df]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 40%, rgba(255,255,255,0.5) 0%, transparent 45%),
                linear-gradient(160deg, #f0ebe4 0%, #d9d2c8 40%, #c8bfb3 100%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.6) 2px, transparent 2px),
                linear-gradient(90deg, rgba(255,255,255,0.6) 2px, transparent 2px),
                linear-gradient(rgba(180,170,155,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(180,170,155,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px, 80px 80px, 20px 20px, 20px 20px",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            {animated ? (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="relative flex size-28 sm:size-32 items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/80 bg-orange-500/15" />
                <div className="absolute inset-2 rounded-full border border-orange-400/30" />
              </motion.div>
            ) : (
              <div className="relative flex size-28 sm:size-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/80 bg-orange-500/15" />
                <div className="absolute inset-2 rounded-full border border-orange-400/30" />
              </div>
            )}

            {animated ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.55, type: "spring", stiffness: 260, damping: 18 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
              >
                <PinMarker />
              </motion.div>
            ) : (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <PinMarker />
              </div>
            )}
          </div>

          {MAP_PINS.map((pin, i) =>
            animated ? (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: pin.delay, type: "spring", stiffness: 300, damping: 20 }}
                className="absolute size-2.5 rounded-full bg-orange-500 ring-2 ring-white shadow-sm"
                style={{ top: pin.top, left: pin.left }}
              />
            ) : (
              <span
                key={i}
                className="absolute size-2.5 rounded-full bg-orange-500 ring-2 ring-white shadow-sm"
                style={{ top: pin.top, left: pin.left }}
              />
            ),
          )}

          {animated ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="absolute top-3 left-3 right-3"
            >
              <SearchBar />
            </motion.div>
          ) : (
            <div className="absolute top-3 left-3 right-3">
              <SearchBar />
            </div>
          )}

          <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-medium text-[#616161] shadow-sm">
            Radio: 2 km
          </div>
        </div>

        <div className="border-t border-[#e8e8e8] bg-[#fafafa] px-3 py-3 dark:border-white/10 dark:bg-[#1a1a1a]">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#616161] sm:text-xs dark:text-white/50">
              Clientes encontrados
            </p>
            {animated ? (
              <motion.span
                {...fadeIn(1.6, {
                  initial: { scale: 0.8 },
                  animate: { scale: 1 },
                  transition: { duration: 0.35 },
                })}
                className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              >
                {PRODUCT_DEMO_LEADS.length} leads
              </motion.span>
            ) : (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                {PRODUCT_DEMO_LEADS.length} leads
              </span>
            )}
          </div>

          <ul className="space-y-1.5">
            {PRODUCT_DEMO_LEADS.map((lead, i) =>
              animated ? (
                <motion.li
                  key={`${lead.name}-${i}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.18, duration: 0.4, ease: "easeOut" }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-2 shadow-sm dark:border-white/5 dark:bg-white/[0.04] dark:shadow-none"
                >
                  <LeadRow lead={lead} />
                </motion.li>
              ) : (
                <li
                  key={`${lead.name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-2 shadow-sm dark:border-white/5 dark:bg-white/[0.04] dark:shadow-none"
                >
                  <LeadRow lead={lead} />
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      {showLiveBadge &&
        (animated ? (
          <motion.div
            {...fadeIn(0.9, {
              initial: { scale: 0.9 },
              animate: { scale: 1 },
              transition: { duration: 0.4 },
            })}
            className="absolute -top-2.5 right-3 flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg sm:right-4 sm:text-xs"
          >
            <LiveDot />
            Datos en tiempo real
          </motion.div>
        ) : (
          <div className="absolute -top-2.5 right-3 flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg sm:right-4 sm:text-xs">
            <LiveDot />
            Datos en tiempo real
          </div>
        ))}

      {showSuccessToast &&
        (animated ? (
          <motion.div
            initial={{ opacity: 0, y: 8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 2.1, duration: 0.45 }}
            className="absolute -bottom-8 -left-8 max-w-[200px] rounded-xl border border-green-500/30 bg-green-50 px-3 py-2 shadow-xl dark:bg-[#1a3328]"
          >
            <p className="text-[10px] font-semibold text-green-700 sm:text-xs dark:text-green-400">
              {PRODUCT_DEMO_LEADS.length} leads de Restaurantes agregados
            </p>
          </motion.div>
        ) : (
          <div className="absolute -bottom-8 -left-8 max-w-[200px] rounded-xl border border-green-500/30 bg-green-50 px-3 py-2 shadow-xl dark:bg-[#1a3328]">
            <p className="text-[10px] font-semibold text-green-700 sm:text-xs dark:text-green-400">
              {PRODUCT_DEMO_LEADS.length} leads de Restaurantes agregados
            </p>
          </div>
        ))}
    </MotionWrap>
  );
}

function PinMarker() {
  return (
    <div className="relative">
      <span className="mb-1 block whitespace-nowrap rounded-md bg-[#212121]/90 px-2 py-0.5 text-[9px] font-medium text-white shadow-sm">
        Centro de búsqueda
      </span>
      <div className="mx-auto flex size-5 items-center justify-center rounded-full bg-[#2563eb] shadow-md ring-2 ring-white">
        <HugeiconsIcon icon={Location01Icon} size={12} className="text-white" />
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white/95 p-1.5 shadow-lg">
      <span className="shrink-0 rounded-lg bg-orange-500 px-2 py-1 text-[9px] font-semibold text-white sm:text-[10px]">
        Categoría
      </span>
      <span className="min-w-0 flex-1 truncate px-1 text-[10px] text-[#616161] sm:text-xs">
        Restaurantes
      </span>
      <span className="hidden shrink-0 rounded-md border border-[#e0e0e0] px-1.5 py-0.5 text-[9px] text-[#616161] sm:inline">
        2 km
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-orange-500 px-2 py-1 text-[9px] font-semibold text-white sm:text-[10px]">
        <HugeiconsIcon icon={Search01Icon} size={11} />
        Buscar
      </span>
    </div>
  );
}

function LeadRow({ lead }: { lead: (typeof PRODUCT_DEMO_LEADS)[number] }) {
  return (
    <>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[#212121] dark:text-white/90">
          {lead.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#616161] dark:text-white/45">
          <HugeiconsIcon icon={CallIcon} size={10} />
          {lead.phone}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-0.5 text-amber-500 dark:text-amber-400">
        <HugeiconsIcon icon={StarIcon} size={12} />
        <span className="text-xs font-semibold">{lead.rating}</span>
      </span>
    </>
  );
}

function LiveDot() {
  return (
    <span className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70 opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-white" />
    </span>
  );
}
