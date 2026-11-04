"use client";

import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  Alert02Icon,
  Bone01Icon,
  Calendar03Icon,
  Coins01Icon,
  CreditCardIcon,
  CursorPointer01Icon,
  Login01Icon,
  MapsLocation01Icon,
  SecurityBlockIcon,
  Shield01Icon,
  UserMultipleIcon,
  UserSettings01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import { ACTIVITY_TYPE_LABELS, AI_FEATURE_LABELS, PANEL_SECTION_LABELS, pageLabel } from "../constants";
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
import { ContextDetails, ContextLine, hasContext } from "./ActivityContext";

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
  admin: { icon: Shield01Icon, tone: "bg-dash-surface-2 text-dash-soft" },
  team: { icon: UserSettings01Icon, tone: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  product: {
    icon: CursorPointer01Icon,
    tone: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
  errors: { icon: Alert02Icon, tone: "bg-red-500/15 text-red-700 dark:text-red-300" },
  pet: { icon: Bone01Icon, tone: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  security: { icon: SecurityBlockIcon, tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
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
  // Errores de la app (app.error, app.client_error)
  kind: "Falla",
  opType: "Petición",
  code: "Código",
  variables: "Variables",
  digest: "Id del error",
  stack: "Pila",
  online: "Con red",
  // Seguridad (límites y bloqueos)
  rule: "Regla",
  limit: "Límite",
  windowMinutes: "Ventana (min)",
  direction: "Dirección",
  // Eventos propios (ActivityEvent)
  fields: "Campos",
  added: "Agregó",
  removed: "Quitó",
  section: "Sección",
  cta: "Botón",
  plan: "Plan",
  count: "Cantidad",
  attempt: "Intento",
  nextAttempt: "Próximo intento",
  periodEnd: "Nuevo fin de periodo",
  currentPeriodEnd: "Fin de periodo",
  currency: "Moneda",
  reason: "Motivo",
  recipientCount: "Destinatarios",
  sentCount: "Enviados",
  failedCount: "Fallidos",
  subject: "Asunto",
  imported: "Importados",
  skippedDuplicates: "Ya existían",
  linkedMessages: "Mensajes enlazados",
  calendarsCount: "Calendarios",
  allowance: "Cupo del mes",
  used: "Usados",
  tour: "Tour",
  scheduledDate: "Fecha",
  priority: "Prioridad",
  keys: "Módulos",
  // Kadesh Pet
  rating: "Calificación",
  commentKind: "Tipo de comentario",
  approved: "Aprobada",
  role: "Rol",
};

/** Nombres legibles de campos que aparecen en `changes` y `fields`. */
const FIELD_LABELS: Record<string, string> = {
  status: "estado",
  approved: "aprobada",
  paid: "pagada",
  planName: "plan",
  planCost: "costo",
  planFrequency: "frecuencia",
  planLeadLimit: "créditos del plan",
  newCreditsAdded: "créditos agregados",
  activatedAt: "inicio",
  currentPeriodEnd: "fin de periodo",
  stripeSubscriptionId: "suscripción de Stripe",
  estimatedValue: "valor estimado",
  aiBillingMode: "cobro de IA",
  aiProvider: "proveedor de IA",
  aiModel: "modelo",
  apiKeyAction: "llave",
  accessToken: "token",
  appSecret: "secreto",
  name: "nombre",
  cost: "costo",
  costOld: "costo anterior",
  leadLimit: "créditos",
  creditsToAdd: "créditos",
  active: "activo",
  bestSeller: "más vendido",
};

/** Valores de `kind`, `opType` y `commentKind` en español. */
const ERROR_VALUE_LABELS: Record<string, string> = {
  network: "Conexión",
  crash: "Pantalla caída",
  script: "Error de código",
  chunk: "No cargó la pantalla",
  comment: "Comentario",
  duplicate_report: "Posible duplicado",
  possible_match: "Posible coincidencia",
  query: "Consulta",
  mutation: "Cambio",
  subscription: "Suscripción",
};

function readable(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return formatCredits(value);
  if (Array.isArray(value)) return value.map(readable).join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function metaRows(meta: Record<string, unknown> | null) {
  if (!meta) return [];
  const rows: Array<{ key: string; label: string; value: string }> = [];

  // Cambio de un solo valor (etapa, estado, oportunidad…): una fila "antes → después".
  if ("from" in meta || "to" in meta) {
    rows.push({ key: "change", label: "Cambio", value: `${readable(meta.from)} → ${readable(meta.to)}` });
  }

  // Varios campos: { campo: [antes, después] }.
  if (meta.changes && typeof meta.changes === "object" && !Array.isArray(meta.changes)) {
    for (const [field, pair] of Object.entries(meta.changes as Record<string, unknown>)) {
      const label = FIELD_LABELS[field] ?? field;
      const value = Array.isArray(pair) && pair.length === 2
        ? `${readable(pair[0])} → ${readable(pair[1])}`
        : readable(pair);
      rows.push({ key: `changes.${field}`, label: label.charAt(0).toUpperCase() + label.slice(1), value });
    }
  }

  for (const [key, value] of Object.entries(meta)) {
    if (!META_LABELS[key] || value === null || value === "" || value === undefined) continue;
    let text = readable(value);
    if (key === "feature") text = AI_FEATURE_LABELS[String(value)] ?? String(value);
    if (key === "radius") text = String(value);
    if ((key === "kind" || key === "opType" || key === "commentKind") && typeof value === "string") {
      text = ERROR_VALUE_LABELS[value] ?? value;
    }
    // Antes de la fase 6.1, `kind` de app.error guardaba si era consulta o cambio.
    if (key === "kind" && (value === "query" || value === "mutation")) {
      rows.push({ key: "opType", label: META_LABELS.opType, value: text });
      continue;
    }
    if (key === "fields" && Array.isArray(value)) {
      text = value.map((field) => FIELD_LABELS[String(field)] ?? String(field)).join(", ");
    }
    rows.push({ key, label: META_LABELS[key], value: text });
  }
  return rows;
}

/** El back guarda la llave de la sección ("cotizaciones"); aquí se muestra su nombre. */
function itemTitle(item: AdminActivityItem): string {
  const section = typeof item.meta?.section === "string" ? item.meta.section : null;
  if (item.kind === "ui.section_viewed" && section) {
    // Kadesh Pet manda la pantalla como ruta (`/perfil?tab=pets`, `/animales/:id`).
    if (section.startsWith("/")) return `Abrió ${pageLabel(section) ?? section}`;
    return `Abrió ${PANEL_SECTION_LABELS[section] ?? section}`;
  }
  return item.title;
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
  onFilterIp,
}: {
  item: AdminActivityItem;
  showCompany: boolean;
  onOpenCompany?: (companyId: string) => void;
  onOpenPerson?: (userId: string, companyId: string | null) => void;
  onFilterIp?: (ip: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = TYPE_STYLE[item.type] ?? TYPE_STYLE.admin;
  const rows = metaRows(item.meta);
  const expandable = rows.length > 0 || hasContext(item);
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
              "min-w-0 text-left text-sm font-medium text-dash-ink",
              expandable && "cursor-pointer hover:text-orange-600 dark:hover:text-orange-400",
            )}
          >
            {itemTitle(item)}
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
            className="shrink-0 text-xs text-dash-faint"
          >
            {time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
          </time>
        </div>
        {item.detail ? (
          <p
            className={cn(
              "mt-0.5 text-xs text-dash-muted",
              !open && "line-clamp-2",
            )}
          >
            {item.detail}
          </p>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-dash-faint">
          <span>{ACTIVITY_TYPE_LABELS[item.type] ?? item.type}</span>
          {item.actor ? (
            <>
              <span aria-hidden>·</span>
              {onOpenPerson ? (
                <button
                  type="button"
                  onClick={() => onOpenPerson(item.actor!.id, item.company?.id ?? null)}
                  className="cursor-pointer font-medium text-dash-muted hover:text-orange-600 dark:hover:text-orange-400"
                >
                  {formatPersonName(item.actor.name, item.actor.lastName)}
                </button>
              ) : (
                <span className="font-medium text-dash-muted">
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
                  className="cursor-pointer font-medium text-dash-muted hover:text-orange-600 dark:hover:text-orange-400"
                >
                  {item.company.name}
                </button>
              ) : (
                <span>{item.company.name}</span>
              )}
            </>
          ) : null}
        </p>
        <ContextLine item={item} />
        {open && rows.length ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-dash-surface-2 p-3 text-xs sm:grid-cols-3">
            {rows.map((row) => (
              <div key={row.key} className="min-w-0">
                <dt className="text-dash-faint">{row.label}</dt>
                <dd className={cn("break-words text-dash-ink", row.key === "stack" && "whitespace-pre-wrap font-mono text-[11px]")}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {open ? <ContextDetails item={item} onFilterIp={onFilterIp} /> : null}
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
  onFilterIp,
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
  /** "Ver todo de esta IP". Sin esto, el enlace lleva a Actividad filtrada por esa IP. */
  onFilterIp?: (ip: string) => void;
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
            <div className="h-9 w-9 rounded-full dash-shimmer" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/3 rounded dash-shimmer" />
              <div className="h-3 w-1/3 rounded dash-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    if (bare) {
      return <p className="text-sm text-dash-muted">{emptyDescription}</p>;
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
                "pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-dash-faint",
                !bare &&
                  "sticky top-[3.85rem] z-[1] -mx-4 bg-dash-surface/95 px-4 backdrop-blur sm:-mx-5 sm:px-5 lg:top-[4.75rem]",
              )}
            >
              {group.label}
            </h4>
            <ul className="divide-y divide-dash-line">
              {group.items.map((item) => (
                <TimelineRow
                  key={item.id}
                  item={item}
                  showCompany={showCompany}
                  onOpenCompany={onOpenCompany}
                  onOpenPerson={onOpenPerson}
                  onFilterIp={onFilterIp}
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
