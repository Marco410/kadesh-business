"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  LinkSquare02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { ROLE_LABELS } from "../../constants";
import {
  AdminAvatar,
  AdminProgressBar,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPersonName,
  formatPlanFrequency,
  surfaceClass,
} from "../../ui";
import { getCurrentCreditPeriodParts } from "../../credits";
import { SubscriptionStatusBadge } from "../AdminCompaniesList";
import type { AdminCompanyInsights, AdminCompanyProfile } from "../clients-queries";
import { daysUntil, lastAccessAt, monthLabel, stripeCustomerUrl } from "./format";
import AccountManagerSelect from "./ops/AccountManagerSelect";
import CompanyControl from "./ops/CompanyControl";

function categoriesLabel(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "Todas (sin límite)";
  return value.map(String).join(", ");
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    sileo.success({ title: `${label} copiado` });
  } catch {
    sileo.error({ title: "No se pudo copiar" });
  }
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-[#9e9e9e]">{label}</p>
        <p className="truncate font-mono text-xs text-[#212121] dark:text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => copy(value, label)}
        aria-label={`Copiar ${label}`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-black/5 dark:text-[#b0b0b0] dark:hover:bg-white/10 cursor-pointer"
      >
        <HugeiconsIcon icon={Copy01Icon} size={16} />
      </button>
    </div>
  );
}

/**
 * Columna fija del 360: quién es la empresa, qué plan tiene, cuánto le queda,
 * quién está en el equipo y las dos acciones principales.
 */
export default function CompanyProfileCard({
  company,
  insights,
  focusPersonId,
  onAdjustPlan,
  onExtendTrial,
  onSendEmail,
  onFocusPerson,
  onRefresh,
}: {
  company: AdminCompanyProfile;
  insights: AdminCompanyInsights | null;
  focusPersonId: string | null;
  onAdjustPlan: (() => void) | null;
  /** Solo con plan gratuito (prueba). */
  onExtendTrial: (() => void) | null;
  onSendEmail: () => void;
  onFocusPerson: (userId: string) => void;
  onRefresh: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const sub = company.subscriptions[0] ?? null;
  const period = company.creditPeriods[0] ?? null;
  const plan = period?.planAllowance ?? sub?.planLeadLimit ?? company.plan?.leadLimit ?? 0;
  const bonus = period?.bonusAllowance ?? company.purchasedBonusCredits ?? 0;
  const used = period?.used ?? 0;
  const total = plan + bonus;
  const remaining = Math.max(0, total - used);
  const { year, month } = getCurrentCreditPeriodParts();
  const teamStats = new Map((insights?.team ?? []).map((m) => [m.userId, m]));
  const lastLogin = company.users.reduce<string | null>(
    (max, u) => (u.lastLoginAt && (!max || u.lastLoginAt > max) ? u.lastLoginAt : max),
    null,
  );

  const trialEnd = sub?.status === "trialing" ? sub.currentPeriodEnd : null;
  const trialDays = daysUntil(trialEnd);
  let periodLine: string | null = null;
  if (trialEnd) {
    periodLine =
      trialDays != null && trialDays < 0
        ? `La prueba terminó el ${formatDateShort(trialEnd, false)}`
        : `Prueba hasta el ${formatDateShort(trialEnd, false)}`;
  } else if (sub?.currentPeriodEnd) {
    periodLine = `Renueva el ${formatDateShort(sub.currentPeriodEnd, false)}`;
  }

  return (
    <aside className={`${surfaceClass} flex flex-col gap-5 p-4 sm:p-5 lg:sticky lg:top-24`}>
      <div>
        <h2 className="text-xl font-bold text-[#212121] dark:text-white">{company.name}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <AdminStatusBadge
            label={sub?.planName || company.plan?.name || "Sin plan"}
            className="bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
          />
          <SubscriptionStatusBadge status={sub?.status} />
          {company.suspendedAt ? (
            <AdminStatusBadge
              label="Acceso suspendido"
              className="bg-red-500/15 text-red-700 dark:text-red-300"
            />
          ) : null}
        </div>
        <p className="mt-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
          Cliente desde {formatDateShort(company.createdAt, false)}
          {sub?.planCost
            ? ` · ${formatMoney(sub.planCost, sub.planCurrency)} ${formatPlanFrequency(sub.planFrequency)}`
            : ""}
        </p>
        {periodLine ? (
          <p
            className={`mt-1 text-xs ${
              trialDays != null && trialDays <= 3
                ? "font-semibold text-amber-700 dark:text-amber-400"
                : "text-[#616161] dark:text-[#b0b0b0]"
            }`}
          >
            {periodLine}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-[#9e9e9e]">
          {insights?.lastActivityAt
            ? `Última actividad: ${formatDate(insights.lastActivityAt)}`
            : lastLogin
              ? `Último acceso: ${formatDate(lastLogin)}`
              : "Nadie del equipo ha entrado"}
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
            Créditos de {monthLabel(year, month)}
          </p>
          <p className="text-sm font-semibold tabular-nums text-[#212121] dark:text-white">
            {formatCredits(remaining)}
            <span className="font-normal text-[#9e9e9e]"> / {formatCredits(total)}</span>
          </p>
        </div>
        <div className="mt-2">
          <AdminProgressBar value={used} max={total} label="Créditos usados este mes" />
        </div>
        <p className="mt-1.5 text-xs text-[#9e9e9e]">
          {formatCredits(used)} usados · {formatCredits(plan)} del plan
          {bonus ? ` + ${formatCredits(bonus)} extra` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={onAdjustPlan ?? undefined}
          disabled={!onAdjustPlan}
          title={onAdjustPlan ? undefined : "La empresa no tiene suscripción"}
          className="h-11 w-full rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          Ajustar plan
        </button>
        <button
          type="button"
          onClick={onSendEmail}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
        >
          <HugeiconsIcon icon={Mail01Icon} size={16} />
          Enviar correo
        </button>
        {onExtendTrial ? (
          <button
            type="button"
            onClick={onExtendTrial}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
          >
            Extender prueba
          </button>
        ) : null}
      </div>

      <AccountManagerSelect
        companyId={company.id}
        manager={company.accountManager}
        onChanged={onRefresh}
      />

      <CompanyControl company={company} onChanged={onRefresh} />

      <div>
        <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
          Equipo ({company.usersCount ?? company.users.length})
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {company.users.map((user) => {
            const stats = teamStats.get(user.id);
            const selected = user.id === focusPersonId;
            // Lo más reciente: acción registrada, panel abierto (latido) o login.
            const seen = lastAccessAt(
              lastAccessAt(stats?.lastActivityAt, stats?.lastSeenAt),
              user.lastLoginAt,
            );
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => onFocusPerson(user.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors cursor-pointer ${
                    selected
                      ? "bg-orange-500/10 ring-1 ring-orange-400"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/5"
                  }`}
                >
                  <AdminAvatar name={user.name} lastName={user.lastName} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#212121] dark:text-white">
                      {formatPersonName(user.name, user.lastName)}
                      {user.suspendedAt ? (
                        <span className="ml-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                          · Suspendida
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-[#9e9e9e]">
                      {ROLE_LABELS[user.roles[0]?.name ?? ""] ?? user.roles[0]?.name ?? "Sin rol"}
                      {" · "}
                      {seen ? formatDate(seen) : "Nunca entró"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* En móvil los datos secundarios se pliegan para llegar rápido a las secciones. */}
      <div className={showMore ? "block" : "hidden lg:block"}>
        <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">Más datos</p>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-[#9e9e9e]">Contacto</dt>
            <dd className="break-words text-[#212121] dark:text-white">
              {[company.contactEmail, company.contactPhone].filter(Boolean).join(" · ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9e9e9e]">Categorías de Maps permitidas</dt>
            <dd className="break-words text-[#212121] dark:text-white">
              {categoriesLabel(company.allowedGooglePlaceCategories)}
            </dd>
          </div>
          {company.onboardingMainOffer ||
          company.onboardingIdealCustomer ||
          company.onboardingAvgTicketValue ||
          company.onboardingSalesPain ? (
            <div>
              <dt className="text-xs text-[#9e9e9e]">Lo que contó en el onboarding</dt>
              <dd className="mt-1 space-y-1 text-xs leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                {company.onboardingMainOffer ? <p>Vende: {company.onboardingMainOffer}</p> : null}
                {company.onboardingIdealCustomer ? (
                  <p>Cliente ideal: {company.onboardingIdealCustomer}</p>
                ) : null}
                {company.onboardingAvgTicketValue ? (
                  <p>Ticket promedio: {company.onboardingAvgTicketValue}</p>
                ) : null}
                {company.onboardingSalesPain ? (
                  <p>Lo que le duele: {company.onboardingSalesPain}</p>
                ) : null}
              </dd>
            </div>
          ) : null}
          <CopyRow label="ID de empresa" value={company.id} />
          {sub?.stripeCustomerId ? (
            <div className="flex flex-col gap-1.5">
              <CopyRow label="Cliente de Stripe" value={sub.stripeCustomerId} />
              <a
                href={stripeCustomerUrl(sub.stripeCustomerId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
              >
                Ver en Stripe
                <HugeiconsIcon icon={LinkSquare02Icon} size={14} />
              </a>
            </div>
          ) : null}
        </dl>
      </div>
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        aria-expanded={showMore}
        className="-mt-2 self-start text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400 lg:hidden cursor-pointer"
      >
        {showMore ? "Ver menos" : "Ver más datos"}
      </button>
    </aside>
  );
}
