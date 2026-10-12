"use client";

import { useMemo, type ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import { mergePlanFeatures } from "../../../planFeatures";
import {
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPersonName,
  formatPlanFrequency,
} from "../../../ui";
import { SubscriptionStatusBadge } from "../../AdminCompaniesList";
import {
  ADMIN_COMPANY_BILLING_QUERY,
  companyBillingVariables,
  type AdminCompanyBillingResponse,
} from "../../clients-queries";

const STEP_LABELS: Record<string, string> = {
  SUCCESS: "Contrató el plan",
  CREDIT_SUCCESS: "Compró créditos",
  USER_NOT_FOUND: "Usuario no encontrado",
  NO_COMPANY: "Sin empresa",
  NO_PLAN_RESOLVED: "Plan no encontrado",
  NO_STRIPE_PRICE_ID: "Plan sin precio de Stripe",
  TOTAL_MISMATCH: "El total no coincide",
  PAYMENT_METHOD_NOT_FOUND: "Tarjeta no encontrada",
  STRIPE_OR_SERVER_ERROR: "Error de Stripe o del servidor",
  NO_CREDIT_PACKAGE: "Paquete de créditos no encontrado",
  NO_ACTIVE_SUBSCRIPTION: "Sin suscripción activa",
  CREDIT_PACKAGE_INACTIVE: "Paquete de créditos apagado",
  STRIPE_KEY_MISSING: "Stripe sin configurar",
  SESSION_MISMATCH: "Sesión de otra cuenta",
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  succeeded: { label: "Cobrado", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  failed: { label: "Rechazado", className: "bg-red-500/15 text-red-700 dark:text-red-300" },
  refunded: { label: "Reembolsado", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  cancelled: { label: "Cancelado", className: "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]" },
  pending: { label: "Pendiente", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  processing: { label: "En proceso", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
};

const COMMISSION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  EARNED: "Ganada",
  CANCELLED: "Cancelada",
  PAID: "Pagada",
};

function List({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">{children}</ul>;
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">{text}</p>;
}

/** Suscripción vigente y su historia: contratos, intentos de pago, cobros, tarjetas y referidos. */
export default function CompanyBilling({
  companyId,
  onAdjustPlan,
}: {
  companyId: string;
  onAdjustPlan: (() => void) | null;
}) {
  const variables = useMemo(() => companyBillingVariables(companyId), [companyId]);
  const { data, loading, error } = useQuery<AdminCompanyBillingResponse>(
    ADMIN_COMPANY_BILLING_QUERY,
    { variables, fetchPolicy: "cache-and-network" },
  );

  if (error) return <AdminErrorState message={error.message} />;
  if (loading && !data) return <AdminLoadingRows rows={6} />;
  if (!data) return null;

  const subscriptions = data.saasCompany?.subscriptions ?? [];
  const current = subscriptions[0] ?? null;
  const features = current ? mergePlanFeatures(current.planFeatures) : [];
  const includedCount = features.filter((f) => f.included).length;

  return (
    <div className="flex flex-col gap-4">
      <AdminSectionCard
        title="Suscripción vigente"
        action={
          onAdjustPlan ? (
            <button
              type="button"
              onClick={onAdjustPlan}
              className="h-10 rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
            >
              Ajustar plan
            </button>
          ) : null
        }
      >
        {!current ? (
          <Empty text="La empresa no tiene suscripción." />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-[#212121] dark:text-white">
                {current.planName || "Plan"}
              </p>
              <SubscriptionStatusBadge status={current.status} />
            </div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-[#9e9e9e]">Precio</dt>
                <dd className="text-[#212121] dark:text-white">
                  {current.planCost
                    ? `${formatMoney(current.planCost, current.planCurrency)} ${formatPlanFrequency(current.planFrequency)}`
                    : "Gratis"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9e9e9e]">Periodo</dt>
                <dd className="text-[#212121] dark:text-white">
                  {formatDateShort(current.activatedAt, false)} → {formatDateShort(current.currentPeriodEnd, false)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9e9e9e]">Créditos del plan</dt>
                <dd className="text-[#212121] dark:text-white">
                  {current.planLeadLimit != null ? `${formatCredits(current.planLeadLimit)} al mes` : "—"}
                </dd>
              </div>
            </dl>
            <div>
              <p className="text-xs text-[#9e9e9e]">
                Módulos incluidos ({includedCount} de {features.length})
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {features.map((f) => (
                  <li
                    key={f.key}
                    title={f.description}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      f.included
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                        : "bg-black/5 text-[#9e9e9e] line-through dark:bg-white/5",
                    )}
                  >
                    {f.included ? <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} /> : null}
                    {f.name}
                    {f.beta ? " · Beta" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </AdminSectionCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminSectionCard title={`Historial de contratos (${subscriptions.length})`}>
          {subscriptions.length === 0 ? (
            <Empty text="Sin contratos." />
          ) : (
            <List>
              {subscriptions.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#212121] dark:text-white">
                      {s.planName || "Plan"}
                      {s.planCost ? ` · ${formatMoney(s.planCost, s.planCurrency)}` : ""}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {formatDateShort(s.activatedAt ?? s.createdAt, false)} →{" "}
                      {formatDateShort(s.currentPeriodEnd, false)}
                    </p>
                  </div>
                  <SubscriptionStatusBadge status={s.status} />
                </li>
              ))}
            </List>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Intentos de pago"
          description="Cada checkout o recarga, con el paso donde falló."
        >
          {data.saasSubscriptionLogs.length === 0 ? (
            <Empty text="Sin intentos registrados." />
          ) : (
            <List>
              {data.saasSubscriptionLogs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#212121] dark:text-white">
                      {STEP_LABELS[log.step ?? ""] ?? log.step ?? "Intento"}
                      {log.plan?.name ? ` · ${log.plan.name}` : ""}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {formatDateShort(log.createdAt, true)}
                      {log.user ? ` · ${formatPersonName(log.user.name, log.user.lastName)}` : ""}
                      {log.totalSubmitted ? ` · $${log.totalSubmitted}` : ""}
                    </p>
                    {!log.success && log.message ? (
                      <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{log.message}</p>
                    ) : null}
                  </div>
                  <AdminStatusBadge
                    label={log.success ? "OK" : "Falló"}
                    className={
                      log.success
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/15 text-red-700 dark:text-red-300"
                    }
                  />
                </li>
              ))}
            </List>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Cobros"
          description="Pagos registrados en Kadesh. Las renovaciones de Stripe aún no llegan aquí."
        >
          {data.saasPayments.length === 0 ? (
            <Empty text="Sin cobros registrados." />
          ) : (
            <List>
              {data.saasPayments.map((p) => {
                const status = PAYMENT_STATUS_LABELS[p.status ?? ""];
                return (
                  <li key={p.id} className="flex items-start justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#212121] dark:text-white">
                        {formatMoney(p.amount == null ? null : Number(p.amount), "MXN")}
                        {p.plan?.name ? ` · ${p.plan.name}` : ""}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {formatDateShort(p.createdAt, true)}
                        {p.paymentMethodType ? ` · ${p.paymentMethodType}` : ""}
                      </p>
                      {p.stripeErrorMessage || p.notes ? (
                        <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                          {p.stripeErrorMessage ?? p.notes}
                        </p>
                      ) : null}
                    </div>
                    <AdminStatusBadge
                      label={status?.label ?? p.status ?? "—"}
                      className={status?.className ?? "bg-black/5 text-[#616161] dark:bg-white/10"}
                    />
                  </li>
                );
              })}
            </List>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Tarjetas guardadas">
          {data.saasPaymentMethods.length === 0 ? (
            <Empty text="Sin tarjetas guardadas." />
          ) : (
            <List>
              {data.saasPaymentMethods.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize text-[#212121] dark:text-white">
                      {m.cardType ?? "Tarjeta"} ···· {m.lastFourDigits ?? "—"}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {m.ownerName ?? (m.user ? formatPersonName(m.user.name, m.user.lastName) : "—")}
                      {m.expMonth && m.expYear ? ` · vence ${m.expMonth}/${m.expYear}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </List>
          )}
        </AdminSectionCard>
      </div>

      {data.saasReferralCommissions.length ? (
        <AdminSectionCard
          title="Comisiones de referido"
          description="Lo que se le debe a quien trajo a esta empresa."
        >
          <List>
            {data.saasReferralCommissions.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                    {formatMoney(c.amount, c.currency)}
                    {c.percentage != null ? ` · ${c.percentage}%` : ""}
                    {c.type === "UPFRONT" ? " · inicial" : c.type === "RECURRING" ? " · recurrente" : ""}
                  </p>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {c.referrer ? formatPersonName(c.referrer.name, c.referrer.lastName) : "—"}
                    {c.periodStart ? ` · ${formatDateShort(c.periodStart, false)}` : ""}
                    {c.periodEnd ? ` → ${formatDateShort(c.periodEnd, false)}` : ""}
                  </p>
                </div>
                <AdminStatusBadge
                  label={COMMISSION_STATUS_LABELS[c.status ?? ""] ?? c.status ?? "—"}
                  className="bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
                />
              </li>
            ))}
          </List>
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
