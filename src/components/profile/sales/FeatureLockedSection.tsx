"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import CurrentPlanSection from "./CurrentPlanSection";

interface FeatureLockedSectionProps {
  sectionName: string;
}

export default function FeatureLockedSection({
  sectionName,
}: FeatureLockedSectionProps) {
  return (
    <div>
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-[#212121] dark:text-white mb-2">
          {sectionName}
        </h3>
        <p className="text-[#616161] dark:text-[#b0b0b0] mb-4">
          Esta funcionalidad no está incluida en tu plan actual. Actualiza tu
          suscripción para acceder a {sectionName}.
        </p>
        <Link
          href={Routes.panelPlans}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
        >
          Ver planes
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </Link>
      </div>
    </div>
  );
}
