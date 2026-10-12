"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { formatDate } from "kadesh/utils/format-date";
import { ROLE_LABELS } from "../../constants";
import {
  AdminAvatar,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "../../ui";
import type { AdminCompanyMember, AdminTeamMemberStats } from "../clients-queries";

/**
 * La persona que se abrió desde Personas (o desde el equipo) queda en foco arriba del 360:
 * se ve quién es y qué ha hecho sin perder el contexto de su empresa.
 */
export default function PersonFocusBanner({
  person,
  stats,
  days,
  onEdit,
  onShowActivity,
  onClear,
}: {
  person: AdminCompanyMember;
  stats: AdminTeamMemberStats | null;
  days: number;
  onEdit: () => void;
  onShowActivity: () => void;
  onClear: () => void;
}) {
  return (
    <section
      aria-label="Persona en foco"
      className={`${surfaceClass} border-orange-300 p-4 dark:border-orange-500/60`}
    >
      <div className="flex items-start gap-3">
        <AdminAvatar name={person.name} lastName={person.lastName} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold text-[#212121] dark:text-white">
              {formatPersonName(person.name, person.lastName, person.secondLastName)}
            </p>
            {person.roles.map((r) => (
              <AdminStatusBadge
                key={r.name}
                label={ROLE_LABELS[r.name] ?? r.name}
                className="bg-black/5 px-2 py-0.5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
              />
            ))}
          </div>
          <p className="mt-0.5 break-all text-sm text-[#616161] dark:text-[#b0b0b0]">
            {person.email ?? "Sin correo"}
            {person.phone ? ` · ${person.phone}` : ""}
          </p>
          <p className="mt-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
            {person.lastLoginAt
              ? `Último acceso: ${formatDate(person.lastLoginAt)}`
              : "Nunca ha entrado"}
            {stats ? ` · ${stats.logins} acceso${stats.logins === 1 ? "" : "s"} en ${days} días` : ""}
            {stats?.failedLogins
              ? ` · ${stats.failedLogins} fallido${stats.failedLogins === 1 ? "" : "s"}`
              : ""}
            {stats?.lastActivityAt ? ` · Última acción: ${formatDate(stats.lastActivityAt)}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="h-10 rounded-xl border border-orange-300 px-4 text-sm font-semibold text-orange-700 hover:bg-orange-500/10 dark:border-orange-500/60 dark:text-orange-300 cursor-pointer"
            >
              Editar persona
            </button>
            <button
              type="button"
              onClick={onShowActivity}
              className="h-10 rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
            >
              Ver su actividad
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Quitar a la persona del foco"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#616161] hover:bg-black/5 dark:text-[#b0b0b0] dark:hover:bg-white/10 cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>
    </section>
  );
}
