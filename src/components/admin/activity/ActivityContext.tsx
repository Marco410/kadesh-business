"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Globe02Icon,
  Location01Icon,
  SmartPhone01Icon,
  Tablet01Icon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { describeUserAgent, type DeviceKind } from "kadesh/utils/user-agent";
import { ACTIVITY_APP_LABELS, ADMIN_TABS, pageLabel } from "../constants";
import type { AdminActivityItem } from "./activity-queries";
import { BlockIpButton } from "../security/BlockIpButton";

/**
 * Desde dónde pasó un evento: app, pantalla, sistema, navegador, dispositivo e IP.
 * `ContextLine` va en la fila cerrada; `ContextDetails`, al expandirla.
 */

const DEVICE_ICONS: Record<DeviceKind, typeof ComputerIcon> = {
  phone: SmartPhone01Icon,
  tablet: Tablet01Icon,
  desktop: ComputerIcon,
  unknown: ComputerIcon,
};

const APP_TONES: Record<string, string> = {
  "pet-web": "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "pet-mobile": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "business-web": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
};

export function hasContext(item: AdminActivityItem): boolean {
  return Boolean(item.ip || item.userAgent || item.app || item.page);
}

export function AppChip({ app }: { app: string | null }) {
  if (!app) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        APP_TONES[app] ?? "bg-dash-surface-2 text-dash-soft",
      )}
    >
      {ACTIVITY_APP_LABELS[app] ?? app}
    </span>
  );
}

/** Una línea: "💻 Windows 10/11 · Chrome 141 · 187.192.209.183 · 📍 Publicar reporte · [Kadesh Pet]". */
export function ContextLine({ item }: { item: AdminActivityItem }) {
  if (!hasContext(item)) return null;
  const ua = describeUserAgent(item.userAgent);
  const system = [ua.os, ua.browser].filter(Boolean).join(" · ");
  const page = pageLabel(item.page) ?? item.page;

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-dash-faint">
      {system ? (
        <span className="inline-flex items-center gap-1">
          <HugeiconsIcon icon={DEVICE_ICONS[ua.device]} size={13} aria-hidden />
          <span className="sr-only">{ua.deviceLabel ?? "Dispositivo"}:</span>
          {system}
        </span>
      ) : null}
      {item.ip ? (
        <>
          {system ? <span aria-hidden>·</span> : null}
          <span className="inline-flex items-center gap-1 tabular-nums">
            <HugeiconsIcon icon={Globe02Icon} size={13} aria-hidden />
            <span className="sr-only">IP:</span>
            {item.ip}
          </span>
        </>
      ) : null}
      {page ? (
        <>
          {system || item.ip ? <span aria-hidden>·</span> : null}
          <span className="inline-flex min-w-0 items-center gap-1" title={item.page ?? undefined}>
            <HugeiconsIcon icon={Location01Icon} size={13} aria-hidden />
            <span className="sr-only">Pantalla:</span>
            <span className="truncate">{page}</span>
          </span>
        </>
      ) : null}
      <AppChip app={item.app} />
    </p>
  );
}

/** Detalle completo al expandir la fila, con acceso a todo lo que pasó desde esa IP. */
export function ContextDetails({
  item,
  onFilterIp,
}: {
  item: AdminActivityItem;
  onFilterIp?: (ip: string) => void;
}) {
  if (!hasContext(item)) return null;
  const ua = describeUserAgent(item.userAgent);
  const page = pageLabel(item.page);
  const rows: Array<{ key: string; label: string; value: ReactNode }> = [];
  if (item.app) rows.push({ key: "app", label: "App", value: ACTIVITY_APP_LABELS[item.app] ?? item.app });
  if (item.page) {
    rows.push({
      key: "page",
      label: "Pantalla",
      value: page ? (
        <>
          {page} <span className="text-dash-faint">({item.page})</span>
        </>
      ) : (
        item.page
      ),
    });
  }
  if (ua.os) rows.push({ key: "os", label: "Sistema", value: ua.os });
  if (ua.browser) rows.push({ key: "browser", label: "Navegador", value: ua.browser });
  if (ua.deviceLabel) rows.push({ key: "device", label: "Dispositivo", value: ua.deviceLabel });
  if (item.ip) {
    const ip = item.ip;
    rows.push({
      key: "ip",
      label: "IP",
      value: (
        <span className="inline-flex flex-wrap items-center gap-x-2">
          <span className="tabular-nums">{ip}</span>
          {onFilterIp ? (
            <button
              type="button"
              onClick={() => onFilterIp(ip)}
              className="cursor-pointer font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              Ver todo de esta IP
            </button>
          ) : (
            <Link
              href={Routes.panelAdminTab(ADMIN_TABS.ACTIVITY, { ip })}
              className="font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              Ver todo de esta IP
            </Link>
          )}
          <BlockIpButton ip={ip} size="sm" />
        </span>
      ),
    });
  }

  return (
    <div className="mt-2 rounded-xl border border-dash-line p-3 text-xs">
      <p className="mb-1.5 font-semibold text-dash-muted">Contexto</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.key} className="min-w-0">
            <dt className="text-dash-faint">{row.label}</dt>
            <dd className="break-words text-dash-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      {item.userAgent ? (
        <div className="mt-2 min-w-0">
          <p className="text-dash-faint">User agent</p>
          <p className="break-all font-mono text-[11px] text-dash-soft">{item.userAgent}</p>
        </div>
      ) : null}
    </div>
  );
}
