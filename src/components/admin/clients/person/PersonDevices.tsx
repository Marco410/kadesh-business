"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, SmartPhone01Icon, Tablet01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { describeUserAgent, type DeviceKind } from "kadesh/utils/user-agent";
import { ADMIN_TABS } from "../../constants";
import { BlockIpButton } from "../../security/BlockIpButton";
import { useAdminNavigation } from "../../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "../../ui";
import {
  ADMIN_PERSON_DEVICES_QUERY,
  type AdminPersonDevicesResponse,
} from "./person-devices-queries";

const DEVICE_ICONS: Record<DeviceKind, typeof ComputerIcon> = {
  phone: SmartPhone01Icon,
  tablet: Tablet01Icon,
  desktop: ComputerIcon,
  unknown: ComputerIcon,
};

const DAYS = 90;

function IpLink({ ip }: { ip: string }) {
  return (
    <Link
      href={Routes.panelAdminTab(ADMIN_TABS.ACTIVITY, { ip })}
      className="font-medium tabular-nums text-dash-soft hover:text-orange-600 hover:underline dark:hover:text-orange-400"
      title="Ver todo lo que pasó desde esta IP"
    >
      {ip}
    </Link>
  );
}

/**
 * Desde dónde entra una persona (últimos 90 días): cada IP + navegador con cuántas veces y
 * cuándo, y otras cuentas que usaron las mismas IPs. Sirve para detectar cuentas compartidas o
 * multicuentas; coincidir en una IP es una señal para revisar, no una prueba.
 */
export default function PersonDevices({ userId }: { userId: string }) {
  const { openPerson } = useAdminNavigation();
  const { data, loading, error } = useQuery<AdminPersonDevicesResponse>(ADMIN_PERSON_DEVICES_QUERY, {
    variables: { userId, days: DAYS },
    fetchPolicy: "cache-and-network",
  });
  const result = data?.adminPersonDevices;

  if (error) return <AdminErrorState message="No se pudieron cargar los dispositivos." />;
  if (loading && !result) return <AdminLoadingRows rows={4} />;
  if (!result || result.devices.length === 0) {
    return (
      <AdminEmptyState
        title="Sin dispositivos registrados"
        description="Cuando entre o use Kadesh, aquí aparecen su IP, sistema y navegador."
      />
    );
  }

  const crowded = result.sharedIps.filter((ip) => ip.crowded);

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-dash-ink">
          Dispositivos e IPs <span className="font-normal text-dash-faint">· últimos {DAYS} días</span>
        </h3>
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {result.devices.map((device) => {
            const ua = describeUserAgent(device.userAgent);
            const label = [ua.os, ua.browser].filter(Boolean).join(" · ") || "Navegador desconocido";
            return (
              <li key={`${device.ip}|${device.userAgent}`} className="flex gap-3 px-4 py-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-dash-surface-2 text-dash-soft">
                  <HugeiconsIcon icon={DEVICE_ICONS[ua.device]} size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dash-ink">
                    {label}
                    {ua.deviceLabel ? <span className="font-normal text-dash-faint"> · {ua.deviceLabel}</span> : null}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-dash-muted">
                    {device.ip ? <IpLink ip={device.ip} /> : <span>Sin IP</span>}
                    <span aria-hidden>·</span>
                    <span>{device.count.toLocaleString("es-MX")} veces</span>
                    <span aria-hidden>·</span>
                    <span title={formatDateShort(device.lastSeen, true)}>última {formatDate(device.lastSeen)}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-dash-faint">
                    Desde {formatDateShort(device.firstSeen, false)} · {device.sources.join(" y ")}
                  </p>
                </div>
                {device.ip ? (
                  <div className="shrink-0 self-center">
                    <BlockIpButton ip={device.ip} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-dash-ink">Cuentas con la misma IP</h3>
        <p className="mb-2 text-xs text-dash-muted">
          Otras personas que usaron alguna de sus IPs. Puede ser la misma persona con dos cuentas, o
          gente de la misma casa u oficina.
        </p>
        {result.sharedAccounts.length === 0 ? (
          <p className="text-sm text-dash-soft">Ninguna otra cuenta comparte sus IPs.</p>
        ) : (
          <ul className={`${surfaceClass} divide-y divide-dash-line`}>
            {result.sharedAccounts.map((account) => (
              <li key={account.person.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openPerson(account.person.id, account.company?.id ?? null)}
                    className="cursor-pointer text-left text-sm font-medium text-dash-ink hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {formatPersonName(account.person.name, account.person.lastName)}
                  </button>
                  <p className="text-xs text-dash-muted">
                    {[account.person.email, account.company?.name].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs">
                    {account.ips.map((ip) => (
                      <IpLink key={ip} ip={ip} />
                    ))}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-dash-faint">
                  {account.count.toLocaleString("es-MX")} veces · última {formatDate(account.lastSeen)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {crowded.length ? (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-dash-muted">
            <AdminStatusBadge label="IP de muchas cuentas" className="bg-dash-surface-2 px-2 py-0.5 text-dash-soft" />
            {crowded.map((ip) => `${ip.ip} (${ip.accounts})`).join(", ")}: red compartida (móvil, empresa o VPN),
            no se listan sus cuentas.
          </p>
        ) : null}
      </section>
    </div>
  );
}
