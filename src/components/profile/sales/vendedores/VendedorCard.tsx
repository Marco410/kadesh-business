"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Mail01Icon,
  CallIcon,
  Chart01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { VendedorWithStats } from "./queries";
import StatItem from "./StatItem";

function formatName(
  name: string,
  lastName: string | null,
  secondLastName: string | null
): string {
  return [name, lastName, secondLastName].filter(Boolean).join(" ");
}

interface VendedorCardProps {
  vendedor: VendedorWithStats;
  onViewDetail: (vendedorId: string) => void;
}

export default function VendedorCard({ vendedor: v, onViewDetail }: VendedorCardProps) {
  return (
    <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-5 shadow-sm hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400">
          <HugeiconsIcon icon={UserIcon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#212121] dark:text-white truncate">
            {formatName(v.name, v.lastName, v.secondLastName)}
          </p>
          {v.email && (
            <a
              href={`mailto:${v.email}`}
              className="mt-0.5 flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 truncate"
            >
              <HugeiconsIcon icon={Mail01Icon} size={14} />
              {v.email}
            </a>
          )}
          {v.phone && (
            <a
              href={`tel:${v.phone}`}
              className="mt-0.5 flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
            >
              <HugeiconsIcon icon={CallIcon} size={14} />
              {v.phone}
            </a>
          )}
        </div>
        {v.salesPersonVerified && (
          <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            Verificado
          </span>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a] grid grid-cols-2 gap-3">
        <StatItem
          label="Leads asignados"
          value={v.businessLeadsAssignedCount ?? 0}
          icon={<HugeiconsIcon icon={Chart01Icon} size={16} />}
        />
        <StatItem label="Actividades" value={v.salesActivitiesCount ?? 0} />
        <StatItem label="Propuestas" value={v.proposalsCount ?? 0} />
        <StatItem label="Seguimientos" value={v.followUpTasksCount ?? 0} />
      </div>
      {v.salesComission != null && (
        <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Comisión:{" "}
          <span className="font-medium text-[#212121] dark:text-white">
            {v.salesComission}%
          </span>
        </p>
      )}
      <div className="mt-4 pt-3 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
        <button
          type="button"
          onClick={() => onViewDetail(v.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <HugeiconsIcon icon={ViewIcon} size={18} />
          Ver detalles
        </button>
      </div>
    </div>
  );
}
