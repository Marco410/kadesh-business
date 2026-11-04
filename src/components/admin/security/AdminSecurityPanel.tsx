"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_TABS } from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminStatusBadge,
  adminInputClass,
  adminLabelClass,
  adminRowClass,
  adminTableClass,
  adminTableWrapClass,
  adminTdClass,
  adminTheadClass,
  adminThClass,
  formatPersonName,
  surfaceClass,
} from "../ui";
import { BlockIpButton, UnblockIpButton } from "./BlockIpButton";
import {
  ADMIN_SECURITY_QUERY,
  SECURITY_RANGES,
  parseSecurityRange,
  type AdminSecurityResponse,
} from "./security-queries";

function IpCell({ ip }: { ip: string }) {
  return (
    <Link
      href={Routes.panelAdminTab(ADMIN_TABS.ACTIVITY, { ip })}
      className="font-medium tabular-nums text-dash-ink hover:text-orange-600 hover:underline dark:hover:text-orange-400"
      title="Ver todo lo que pasó desde esta IP"
    >
      {ip}
    </Link>
  );
}

function BlockedBadge() {
  return (
    <AdminStatusBadge label="Bloqueada" className="ml-2 bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300" />
  );
}

/** Bloquear una IP escrita a mano (p. ej. la de un correo de abuso). */
function ManualBlock() {
  const [ip, setIp] = useState("");
  const value = ip.trim();
  return (
    <div className={cn(surfaceClass, "flex flex-col gap-3 p-4 sm:flex-row sm:items-end")}>
      <div className="flex-1">
        <label htmlFor="manual-block-ip" className={adminLabelClass}>
          Bloquear una IP
        </label>
        <input
          id="manual-block-ip"
          value={ip}
          onChange={(event) => setIp(event.target.value)}
          placeholder="187.192.209.183"
          inputMode="decimal"
          className={adminInputClass}
        />
      </div>
      {value ? <BlockIpButton ip={value} variant="danger" size="md" label="Bloquear" onDone={() => setIp("")} /> : null}
    </div>
  );
}

/**
 * Seguridad: quién se pasó de los límites contra abuso, desde qué IPs se crean varias cuentas y
 * qué IPs están bloqueadas. Las IPs llevan a Actividad filtrada por esa IP.
 */
export default function AdminSecurityPanel() {
  const { searchParams, setParams, openPerson } = useAdminNavigation();
  const rangeSlug = parseSecurityRange(searchParams.get("rango"));
  const days = SECURITY_RANGES.find((range) => range.value === rangeSlug)?.days ?? 7;
  const { data, loading, error } = useQuery<AdminSecurityResponse>(ADMIN_SECURITY_QUERY, {
    variables: { days },
    fetchPolicy: "cache-and-network",
  });

  const summary = data?.adminSecuritySummary;
  const blockedIps = data?.adminBlockedIps ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-dash-ink">Seguridad</h2>
        <p className="mt-1 text-sm text-dash-muted">
          Límites contra abuso (logins, registros, reportes, comentarios, reseñas, contacto y
          veterinarias), IPs con varias cuentas nuevas e IPs bloqueadas. Cuando alguien se pasa de un
          límite varias veces, te llega un aviso a la campana.
        </p>
      </div>

      <AdminFilterChips
        label="Periodo"
        options={SECURITY_RANGES.map(({ value, label }) => ({ value, label }))}
        value={rangeSlug}
        onChange={(value) => setParams({ rango: value === "7d" ? null : value })}
      />

      {error ? <AdminErrorState message="No se pudo cargar Seguridad." /> : null}
      {loading && !data ? <AdminLoadingRows rows={6} /> : null}

      {summary ? (
        <>
          <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-dash-ink">Límites rebasados</h3>
            {summary.rateLimited.length === 0 ? (
              <AdminEmptyState
                title="Nadie se pasó de los límites"
                description="Cuando alguien haga demasiados intentos, aparece aquí."
              />
            ) : (
              <div className={adminTableWrapClass}>
                <table className={adminTableClass}>
                  <thead className={adminTheadClass}>
                    <tr>
                      <th className={adminThClass}>IP</th>
                      <th className={adminThClass}>Límite</th>
                      <th className={cn(adminThClass, "hidden md:table-cell")}>Persona</th>
                      <th className={cn(adminThClass, "text-right")}>Veces</th>
                      <th className={cn(adminThClass, "hidden lg:table-cell")}>Última vez</th>
                      <th className={adminThClass}>
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.rateLimited.map((hit) => (
                      <tr key={`${hit.ip}|${hit.rule}|${hit.actor?.id ?? ""}`} className={adminRowClass}>
                        <td className={adminTdClass}>
                          {hit.ip ? <IpCell ip={hit.ip} /> : "—"}
                          {hit.blocked ? <BlockedBadge /> : null}
                        </td>
                        <td className={cn(adminTdClass, "text-dash-soft")}>{hit.ruleLabel}</td>
                        <td className={cn(adminTdClass, "hidden md:table-cell")}>
                          {hit.actor ? (
                            <button
                              type="button"
                              onClick={() => openPerson(hit.actor!.id, null)}
                              className="cursor-pointer text-left font-medium text-dash-ink hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              {formatPersonName(hit.actor.name, hit.actor.lastName)}
                            </button>
                          ) : (
                            <span className="text-dash-faint">Sin sesión</span>
                          )}
                        </td>
                        <td className={cn(adminTdClass, "text-right tabular-nums")}>{hit.count}</td>
                        <td className={cn(adminTdClass, "hidden text-dash-soft lg:table-cell")}>
                          {formatDate(hit.lastAt)}
                        </td>
                        <td className={cn(adminTdClass, "text-right")}>
                          {hit.ip && !hit.blocked ? <BlockIpButton ip={hit.ip} /> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-dash-ink">IPs con varias cuentas nuevas</h3>
            <p className="text-sm text-dash-muted">
              Dos o más registros desde la misma IP en el periodo. Puede ser una familia o una
              oficina; muchas cuentas seguidas suelen ser bots o multicuentas.
            </p>
            {summary.signupIps.length === 0 ? (
              <p className="text-sm text-dash-soft">Ninguna IP creó varias cuentas en el periodo.</p>
            ) : (
              <div className={adminTableWrapClass}>
                <table className={adminTableClass}>
                  <thead className={adminTheadClass}>
                    <tr>
                      <th className={adminThClass}>IP</th>
                      <th className={cn(adminThClass, "text-right")}>Cuentas</th>
                      <th className={cn(adminThClass, "hidden sm:table-cell")}>Última</th>
                      <th className={adminThClass}>
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.signupIps.map((row) => (
                      <tr key={row.ip} className={adminRowClass}>
                        <td className={adminTdClass}>
                          <IpCell ip={row.ip} />
                          {row.blocked ? <BlockedBadge /> : null}
                        </td>
                        <td className={cn(adminTdClass, "text-right tabular-nums")}>{row.accounts}</td>
                        <td className={cn(adminTdClass, "hidden text-dash-soft sm:table-cell")}>
                          {formatDate(row.lastAt)}
                        </td>
                        <td className={cn(adminTdClass, "text-right")}>
                          {!row.blocked ? <BlockIpButton ip={row.ip} /> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-dash-ink">
          IPs bloqueadas{summary ? ` (${summary.blockedCount})` : ""}
        </h3>
        <ManualBlock />
        {blockedIps.length === 0 ? (
          data ? <p className="text-sm text-dash-soft">No hay IPs bloqueadas.</p> : null
        ) : (
          <ul className={cn(surfaceClass, "divide-y divide-dash-line")}>
            {blockedIps.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm">
                    <IpCell ip={row.ip} />
                    {!row.active ? (
                      <AdminStatusBadge label="Vencido" className="ml-2 bg-dash-surface-2 px-2 py-0.5 text-dash-soft" />
                    ) : null}
                  </p>
                  {row.reason ? <p className="text-xs text-dash-muted">{row.reason}</p> : null}
                  <p className="text-xs text-dash-faint">
                    {row.expiresAt ? `Hasta ${formatDateShort(row.expiresAt, true)}` : "Indefinido"} · desde{" "}
                    {formatDateShort(row.createdAt, false)}
                    {row.createdBy ? ` · ${formatPersonName(row.createdBy.name, row.createdBy.lastName)}` : ""}
                  </p>
                </div>
                <UnblockIpButton ip={row.ip} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
