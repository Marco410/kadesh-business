"use client";

import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { ROLE_LABELS } from "../../../constants";
import {
  AdminAvatar,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "../../../ui";
import AuthLogList from "../../person/AuthLogList";
import type {
  AdminCompanyInsights,
  AdminCompanyMember,
} from "../../clients-queries";
import { formatMinutes, lastAccessAt } from "../format";

/** Quién usa la plataforma y quién no: uso por persona en la ventana de días. */
export default function CompanyTeam({
  companyId,
  members,
  insights,
  focusPersonId,
  onFocusPerson,
  onEditPerson,
}: {
  companyId: string;
  members: AdminCompanyMember[];
  insights: AdminCompanyInsights | null;
  focusPersonId: string | null;
  onFocusPerson: (userId: string) => void;
  onEditPerson: (userId: string) => void;
}) {
  const stats = new Map((insights?.team ?? []).map((m) => [m.userId, m]));
  const days = insights?.days ?? 30;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Uso de cada persona en los últimos {days} días. Toca una fila para ponerla en foco.
      </p>
      <div className={`${surfaceClass} relative overflow-x-auto`}>
        <table className="w-full min-w-[1160px] text-left text-sm">
          <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
            <tr>
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Accesos</th>
              <th className="px-4 py-3">Tiempo activo</th>
              <th className="px-4 py-3">Última acción</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3">Actividades</th>
              <th className="px-4 py-3">Cotiz.</th>
              <th className="px-4 py-3">Extracc.</th>
              <th className="px-4 py-3">IA</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Tours</th>
              <th className="px-4 py-3">
                <span className="sr-only">Editar</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
            {members.map((member) => {
              const s = stats.get(member.id);
              const selected = member.id === focusPersonId;
              const seenAt = lastAccessAt(member.lastLoginAt, s?.lastSeenAt);
              return (
                <tr
                  key={member.id}
                  onClick={() => onFocusPerson(member.id)}
                  className={`cursor-pointer ${
                    selected ? "bg-orange-500/[0.06]" : "hover:bg-black/[0.03] dark:hover:bg-white/5"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <AdminAvatar name={member.name} lastName={member.lastName} size={30} />
                      <div className="min-w-0">
                        <p className="font-medium text-[#212121] dark:text-white">
                          {formatPersonName(member.name, member.lastName)}
                          {member.suspendedAt ? (
                            <AdminStatusBadge
                              label="Suspendida"
                              className="ml-2 bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300"
                            />
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-[#9e9e9e]">{member.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((r) => (
                        <AdminStatusBadge
                          key={r.name}
                          label={ROLE_LABELS[r.name] ?? r.name}
                          className="bg-black/5 px-2 py-0.5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#212121] dark:text-white">
                    <span className="tabular-nums">{s?.logins ?? 0}</span>
                    {s?.failedLogins ? (
                      <span className="ml-1 text-xs text-red-600 dark:text-red-400">
                        ({s.failedLogins} fallidos)
                      </span>
                    ) : null}
                    <p className="whitespace-nowrap text-xs text-[#9e9e9e]">
                      {seenAt ? `Visto ${formatDateShort(seenAt, false)}` : "Nunca entró"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#212121] dark:text-white">
                    {s?.activeMinutes ? (
                      <>
                        <span className="whitespace-nowrap tabular-nums">
                          {formatMinutes(s.activeMinutes)}
                        </span>
                        <p className="whitespace-nowrap text-xs text-[#9e9e9e]">
                          en {s.activeDays} día{s.activeDays === 1 ? "" : "s"}
                        </p>
                      </>
                    ) : (
                      <span className="text-[#9e9e9e]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                    {s?.lastActivityAt ? formatDate(s.lastActivityAt) : "—"}
                    {s?.changes ? (
                      <p className="whitespace-nowrap text-xs text-[#9e9e9e]">
                        {s.changes} cambio{s.changes === 1 ? "" : "s"} registrado{s.changes === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s?.leadsAssigned ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.activities ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.quotations ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.extractions ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.aiCalls ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.whatsappSent ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {s ? `${s.toursCompleted} vistos · ${s.toursSkipped} saltados` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPerson(member.id);
                      }}
                      className="h-9 rounded-lg border border-[#e0e0e0] px-3 text-xs font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
          Historial de accesos del equipo
        </h3>
        <AuthLogList companyId={companyId} />
      </div>
    </div>
  );
}
