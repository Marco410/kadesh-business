"use client";

import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  Alert02Icon,
  Calendar03Icon,
  Coins01Icon,
  CreditCardIcon,
  Login01Icon,
  MapsLocation01Icon,
  Shield01Icon,
  UserMultipleIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import { ACTIVITY_TYPE_LABELS, AI_FEATURE_LABELS } from "../constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadMore,
  AdminStatusBadge,
  formatCredits,
  formatPersonName,
  surfaceClass,
} from "../ui";
import type { AdminActivityItem } from "./activity-queries";

type IconType = typeof Login01Icon;

const TYPE_STYLE: Record<string, { icon: IconType; tone: string }> = {
  auth: { icon: Login01Icon, tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  extraction: {
    icon: MapsLocation01Icon,
    tone: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
  crm: {
    icon: UserMultipleIcon,
    tone: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  },
  ai: { icon: AiMagicIcon, tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  credits: { icon: Coins01Icon, tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  billing: {
    icon: CreditCardIcon,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  whatsapp: {
    icon: WhatsappIcon,
    tone: "bg-green-500/15 text-green-700 dark:text-green-300",
  },
  calendar: { icon: Calendar03Icon, tone: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  admin: { icon: Shield01Icon, tone: "bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]" },
};

/** Etiquetas de `meta` que vale la pena mostrar al expandir un evento. */
const META_LABELS: Record<string, string> = {
  created: "Leads nuevos",
  alreadyInDb: "Desde la base",
  skippedLowRating: "Descartados por rating",
  syncedCount: "Usados del cupo",
  leadLimit: "Cupo del mes",
  radius: "Radio (km)",
  category: "Categoría",
  message: "Mensaje",
  feature: "Función",
  model: "Modelo",
  provider: "Proveedor",
  billingMode: "Cobro",
  inputTokens: "Tokens de entrada",
  outputTokens: "Tokens de salida",
  creditsCharged: "Créditos",
  durationMs: "Duración (ms)",
  amount: "Monto",
  balanceAfter: "Saldo",
  step: "Paso",
  total: "Total",
  status: "Estado",
  activityType: "Tipo",
  operation: "Operación",
  direction: "Dirección",
};

function metaRows(meta: Record<string, unknown> | null) {
  if (!meta) return [];
  return Object.entries(meta)
    .filter(([key, value]) => META_LABELS[key] && value !== null && value !== "" && value !== undefined)
    .map(([key, value]) => {
      let text = String(value);
      if (key === "feature") text = AI_FEATURE_LABELS[text] ?? text;
      if (typeof value === "number" && key !== "radius") text = formatCredits(value);
      return { key, label: META_LABELS[key], value: text };
    });
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(date, today)) return "Hoy";
  if (same(date, yesterday)) return "Ayer";
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function TimelineRow({
  item,
  showCompany,
  onOpenCompany,
  onOpenPerson,
}: {
  item: AdminActivityItem;
  showCompany: boolean;
  onOpenCompany?: (companyId: string) => void;
  onOpenPerson?: (userId: string, companyId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = TYPE_STYLE[item.type] ?? TYPE_STYLE.admin;
  const rows = metaRows(item.meta);
  const expandable = rows.length > 0;
  const time = new Date(item.occurredAt);

  return (
    <li className="flex gap-3 py-3">
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          item.success ? style.tone : "bg-red-500/15 text-red-700 dark:text-red-300",
        )}
        aria-hidden
      >
        <HugeiconsIcon icon={item.success ? style.icon : Alert02Icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <button
            type="button"
            onClick={() => expandable && setOpen((v) => !v)}
            aria-expanded={expandable ? open : undefined}
            className={cn(
              "min-w-0 text-left text-sm font-medium text-[#212121] dark:text-white",
              expandable && "cursor-pointer hover:text-orange-600 dark:hover:text-orange-400",
            )}
          >
            {item.title}
            {!item.success ? (
              <AdminStatusBadge
                label="Error"
                className="ml-2 bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300"
              />
            ) : null}
          </button>
          <time
            dateTime={item.occurredAt}
            title={formatDateShort(item.occurredAt, true)}
            className="shrink-0 text-xs text-[#9e9e9e]"
          >
            {time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
          </time>
        </div>
        {item.detail ? (
          <p
            className={cn(
              "mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]",
              !open && "line-clamp-2",
            )}
          >
            {item.detail}
          </p>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#9e9e9e]">
          <span>{ACTIVITY_TYPE_LABELS[item.type] ?? item.type}</span>
          {item.actor ? (
            <>
              <span aria-hidden>·</span>
              {onOpenPerson ? (
                <button
                  type="button"
                  onClick={() => onOpenPerson(item.actor!.id, item.company?.id ?? null)}
                  className="cursor-pointer font-medium text-[#616161] hover:text-orange-600 dark:text-[#b0b0b0] dark:hover:text-orange-400"
                >
                  {formatPersonName(item.actor.name, item.actor.lastName)}
                </button>
              ) : (
                <span className="font-medium text-[#616161] dark:text-[#b0b0b0]">
                  {formatPersonName(item.actor.name, item.actor.lastName)}
                </span>
              )}
            </>
          ) : null}
          {showCompany && item.company ? (
            <>
              <span aria-hidden>·</span>
              {onOpenCompany ? (
                <button
                  type="button"
                  onClick={() => onOpenCompany(item.company!.id)}
                  className="cursor-pointer font-medium text-[#616161] hover:text-orange-600 dark:text-[#b0b0b0] dark:hover:text-orange-400"
                >
                  {item.company.name}
                </button>
              ) : (
                <span>{item.company.name}</span>
              )}
            </>
          ) : null}
        </p>
        {open && rows.length ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-[#fafafa] p-3 text-xs dark:bg-[#252525] sm:grid-cols-3">
            {rows.map((row) => (
              <div key={row.key} className="min-w-0">
                <dt className="text-[#9e9e9e]">{row.label}</dt>
                <dd className="break-words text-[#212121] dark:text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Línea de tiempo de eventos agrupada por día. La usan el feed global (Actividad),
 * la sección Actividad del 360 y el panel de una persona.
 */
export default function ActivityTimeline({
  items,
  loading,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  showCompany = true,
  onOpenCompany,
  onOpenPerson,
  emptyTitle = "Sin actividad registrada",
  emptyDescription = "Cuando haya accesos, extracciones, IA, pagos o movimientos del CRM, aparecen aquí.",
  header,
  bare = false,
}: {
  items: AdminActivityItem[];
  loading: boolean;
  error?: Error | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  showCompany?: boolean;
  onOpenCompany?: (companyId: string) => void;
  onOpenPerson?: (userId: string, companyId: string | null) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  header?: ReactNode;
  /** Sin tarjeta propia, para usarla dentro de otra tarjeta (Resumen del 360). */
  bare?: boolean;
}) {
  if (error) {
    return <AdminErrorState message="No se pudo cargar la actividad." />;
  }
  if (loading && items.length === 0) {
    return (
      <div className={cn(surfaceClass, "space-y-3 p-4")} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-9 w-9 rounded-full bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/3 rounded bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    if (bare) {
      return <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">{emptyDescription}</p>;
    }
    return <AdminEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const groups: Array<{ label: string; items: AdminActivityItem[] }> = [];
  for (const item of items) {
    const label = dayLabel(item.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div className="flex flex-col gap-3">
      {header}
      <div className={cn(!bare && surfaceClass, !bare && "px-4 py-2 sm:px-5")}>
        {groups.map((group) => (
          <section key={group.label} className="py-1">
            <h4
              className={cn(
                "pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-[#9e9e9e]",
                !bare &&
                  "sticky top-0 z-[1] -mx-4 bg-white/95 px-4 backdrop-blur dark:bg-[#1e1e1e]/95 sm:-mx-5 sm:px-5",
              )}
            >
              {group.label}
            </h4>
            <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
              {group.items.map((item) => (
                <TimelineRow
                  key={item.id}
                  item={item}
                  showCompany={showCompany}
                  onOpenCompany={onOpenCompany}
                  onOpenPerson={onOpenPerson}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
      {hasMore ? <AdminLoadMore onClick={onLoadMore} loading={loadingMore} /> : null}
    </div>
  );
}
