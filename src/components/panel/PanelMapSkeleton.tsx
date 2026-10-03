"use client";

import { cn } from "kadesh/utils/cn";
import { useFitLeadMapStage } from "kadesh/components/profile/sales/obtener-clientes/useFitLeadMapStage";

const boneClass =
  "motion-safe:animate-pulse rounded-md bg-[#ececec] dark:bg-[#2a2a2a]";

function Bone({ className }: { className?: string }) {
  return <div className={cn(boneClass, className)} />;
}

/** Esqueleto de Extracción: la isla de búsqueda, el mapa y el panel de categorías. */
export default function PanelMapSkeleton() {
  const setStage = useFitLeadMapStage();

  return (
    <div
      ref={setStage}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[calc(100dvh-7.75rem)] w-screen overflow-hidden bg-[#e8eef4] dark:bg-[#1e2a3a]"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando mapa</span>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,148,94,0.16),transparent_58%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(224,124,58,0.14),transparent_55%)]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute top-1/2 left-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        aria-hidden
      >
        <span className="absolute size-32 rounded-full border-2 border-dashed border-[#e07c3a]/45" />
        <span className="absolute size-16 rounded-full border border-dashed border-[#f7945e]/70" />
        <span className="size-3 rounded-full bg-orange-500 shadow-md" />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4 sm:pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 rounded-2xl border border-[#e0e0e0] bg-white/95 p-2 shadow-sm sm:flex-row sm:items-center dark:border-[#3a3a3a] dark:bg-[#1e1e1e]/95">
          <div className="flex gap-1 rounded-xl bg-[#f8f8f8] p-1 dark:bg-[#121212]">
            <Bone className="h-9 w-28 rounded-lg" />
            <Bone className="h-9 w-16 rounded-lg" />
          </div>
          <div className="flex gap-1 rounded-xl bg-[#f8f8f8] p-1 dark:bg-[#121212]">
            <Bone className="h-9 w-24 rounded-lg" />
            <Bone className="h-9 w-28 rounded-lg" />
          </div>
          <Bone className="h-11 min-w-0 flex-1 rounded-xl" />
          <Bone className="h-11 w-full rounded-xl sm:w-24" />
          <Bone className="h-11 w-full rounded-xl bg-orange-200 sm:w-36 dark:bg-orange-500/30" />
        </div>
      </div>

      <div className="absolute right-4 bottom-28 z-10 flex flex-col gap-2 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
        <Bone className="size-11 rounded-full" />
        <Bone className="size-11 rounded-full" />
      </div>

      <div className="absolute bottom-4 left-4 z-10 w-[min(17.5rem,calc(100%-5.5rem))] overflow-hidden rounded-2xl border border-black/8 bg-white/92 shadow-sm sm:bottom-6 sm:left-6 dark:border-white/10 dark:bg-[#171717]/92">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <Bone className="h-3 w-16" />
          <Bone className="h-3 w-14" />
        </div>
        <div className="space-y-1 px-2 pb-2">
          <div className="flex h-11 items-center gap-2.5 rounded-xl px-2">
            <Bone className="size-2.5 shrink-0 rounded-full bg-orange-400" />
            <Bone className="h-3 w-20" />
            <Bone className="ml-auto h-3 w-5" />
            <Bone className="h-6 w-11 shrink-0 rounded-full bg-orange-300 dark:bg-orange-500/40" />
          </div>
          <div className="flex h-11 items-center gap-2.5 rounded-xl px-2">
            <Bone className="size-2.5 shrink-0 rounded-full bg-sky-400" />
            <Bone className="h-3 w-16" />
            <Bone className="ml-auto h-3 w-5" />
            <Bone className="h-6 w-11 shrink-0 rounded-full" />
          </div>
        </div>
        <div className="grid h-11 grid-cols-2 border-t border-black/6 dark:border-white/8">
          <Bone className="m-auto h-3 w-16" />
          <Bone className="m-auto h-3 w-14" />
        </div>
      </div>
    </div>
  );
}
