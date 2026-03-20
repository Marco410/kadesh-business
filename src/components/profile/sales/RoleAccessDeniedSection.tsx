"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";

interface RoleAccessDeniedSectionProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export default function RoleAccessDeniedSection({
  title = "Sin permiso para acceder",
  description = "Tu rol no tiene acceso a esta sección. Si crees que es un error, contacta al administrador de tu empresa.",
  backHref = `${Routes.panel}?tab=ventas`,
  backLabel = "Volver al panel",
}: RoleAccessDeniedSectionProps) {
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/35 p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-[#212121] dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-5 leading-relaxed">
        {description}
      </p>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        {backLabel}
      </Link>
    </div>
  );
}
