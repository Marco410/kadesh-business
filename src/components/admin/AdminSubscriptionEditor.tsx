"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DASH_EASE } from "kadesh/components/app-shell";
import {
  type PlanFeatureKey,
  PLAN_FEATURE_KEYS,
  PLAN_FEATURES_MAP,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import type { AdminSubscriptionRow } from "./types";
import {
  ADMIN_CREDIT_GRANT_MAX,
  ADMIN_CREDIT_GRANT_PRESETS,
} from "./constants";
import { getSubscriptionCredits } from "./credits";
import {
  formatCredits,
  formatMoney,
  formatPersonName,
  formatPlanFrequency,
} from "./ui";

function normalizePlanFeatures(
  value: unknown,
): Array<{ key: string; included?: boolean | null }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { key: string; included?: boolean | null } =>
      Boolean(v && (v as { key?: unknown }).key),
    )
    .map((v) => ({ key: String(v.key), included: v.included ?? null }));
}

function toCalendarDay(value: string | null) {
  if (!value) return "";
  // Keystone manda los días de calendario como `YYYY-MM-DD`. `new Date()` los lee en UTC y en
  // México los mostraba un día antes; al guardar, el periodo se recorría un día cada vez.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function calendarDayOrNull(value: string) {
  const v = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return v;
}

const FEATURE_KEYS = Object.values(PLAN_FEATURE_KEYS);

export default function AdminSubscriptionEditor({
  isOpen,
  onClose,
  subscription,
  saving,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  subscription: AdminSubscriptionRow | null;
  saving: boolean;
  onSave: (args: {
    subscriptionId: string;
    planFeaturesPayload: Array<{ key: string; included: boolean }>;
    activatedAt?: string | null;
    currentPeriodEnd?: string | null;
    creditsToAdd?: number;
  }) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [activatedAtLocal, setActivatedAtLocal] = useState("");
  const [currentPeriodEndLocal, setCurrentPeriodEndLocal] = useState("");
  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  useApplyOnKeyChange(`${isOpen}\0${subscription?.id ?? ""}`, () => {
    if (!isOpen || !subscription?.id) {
      setHydratedId(null);
      return;
    }
    if (hydratedId === subscription.id) return;

    const fromSub = normalizePlanFeatures(subscription.planFeatures);
    const next: Record<string, boolean> = {};
    for (const key of FEATURE_KEYS) {
      next[key] = fromSub.find((f) => f.key === key)?.included ?? false;
    }
    setDraft(next);
    setActivatedAtLocal(toCalendarDay(subscription.activatedAt));
    setCurrentPeriodEndLocal(toCalendarDay(subscription.currentPeriodEnd));
    setCreditsToAdd("");
    setHydratedId(subscription.id);
  });

  const contact = subscription?.company?.users?.[0];
  const credits = getSubscriptionCredits(subscription);
  const parsedCreditsToAdd = Math.floor(Number(creditsToAdd));
  const hasCreditsToAdd =
    Number.isFinite(parsedCreditsToAdd) && parsedCreditsToAdd >= 1;
  const creditsToAddError =
    creditsToAdd.trim() !== "" &&
    (!Number.isFinite(parsedCreditsToAdd) ||
      parsedCreditsToAdd < 1 ||
      parsedCreditsToAdd > ADMIN_CREDIT_GRANT_MAX)
      ? `Indica entre 1 y ${formatCredits(ADMIN_CREDIT_GRANT_MAX)} créditos.`
      : null;
  const statusLabel =
    SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === subscription?.status)
      ?.label ?? "Sin estado";

  return (
    <AnimatePresence>
      {isOpen && subscription ? (
        <>
          <motion.div data-body-scroll-lock
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: DASH_EASE }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              className="bg-dash-surface rounded-t-3xl sm:rounded-3xl shadow-dash-lift font-dash text-dash-ink w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-dash-line"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-[1] bg-dash-surface/95 backdrop-blur px-4 sm:px-6 py-4 border-b border-dash-line flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-dash-ink">
                    {subscription.company?.name ?? "Empresa sin nombre"}
                  </h3>
                  <p className="text-sm text-dash-muted mt-1">
                    {formatPersonName(contact?.name, contact?.lastName)}
                    {contact?.email ? ` · ${contact.email}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink cursor-pointer"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="px-4 sm:px-6 py-5 flex flex-col gap-5">
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-dash-surface-2 p-3">
                    <p className="text-xs text-dash-muted">
                      Plan
                    </p>
                    <p className="mt-1 font-semibold text-dash-ink">
                      {subscription.planName ?? "—"}
                    </p>
                    <p className="text-xs text-dash-muted mt-1">
                      {formatMoney(
                        subscription.planCost,
                        subscription.planCurrency,
                      )}{" "}
                      {formatPlanFrequency(subscription.planFrequency)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-dash-surface-2 p-3">
                    <p className="text-xs text-dash-muted">
                      Estado
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        SUBSCRIPTION_STATUS_CLASSES[
                          subscription.status ?? ""
                        ] ?? "bg-dash-surface-3 text-dash-muted"
                      }`}
                    >
                      {statusLabel}
                    </span>
                    <p className="text-xs text-dash-muted mt-2">
                      Del plan: {formatCredits(subscription.planLeadLimit)}{" "}
                      / mes
                    </p>
                  </div>
                  <div className="rounded-xl bg-dash-surface-2 p-3">
                    <p className="text-xs text-dash-muted">
                      Periodo actual
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dash-ink">
                      {formatDateShort(subscription.activatedAt, false)} →{" "}
                      {formatDateShort(subscription.currentPeriodEnd, false)}
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-dash-ink">
                    Créditos de este mes
                  </h4>
                  <p className="text-xs text-dash-muted mt-1 mb-3">
                    Los extra se suman ahora y se mantienen cada mes, igual
                    que una recarga.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-xl bg-dash-surface-2 p-3">
                      <p className="text-xs text-dash-muted">
                        Disponibles
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dash-ink">
                        {formatCredits(credits.remaining)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-dash-surface-2 p-3">
                      <p className="text-xs text-dash-muted">
                        Del plan
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dash-ink">
                        {formatCredits(credits.plan)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-dash-surface-2 p-3">
                      <p className="text-xs text-dash-muted">
                        Extra
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dash-ink">
                        {formatCredits(credits.bonus)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-dash-surface-2 p-3">
                      <p className="text-xs text-dash-muted">
                        Usados
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dash-ink">
                        {formatCredits(credits.used)}
                      </p>
                    </div>
                  </div>
                  <label className="block">
                    <span className="block text-xs font-medium text-dash-muted mb-1">
                      Agregar créditos extra
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={ADMIN_CREDIT_GRANT_MAX}
                      step={1}
                      inputMode="numeric"
                      value={creditsToAdd}
                      onChange={(e) => setCreditsToAdd(e.target.value)}
                      disabled={saving}
                      placeholder="Ej. 250"
                      className="h-11 w-full rounded-xl border border-dash-line bg-dash-surface px-3 text-sm"
                    />
                  </label>
                  {creditsToAddError ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      {creditsToAddError}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ADMIN_CREDIT_GRANT_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        disabled={saving}
                        onClick={() => setCreditsToAdd(String(amount))}
                        className="h-11 rounded-full border border-dash-line px-4 text-sm font-semibold hover:border-orange-300 cursor-pointer disabled:opacity-60"
                      >
                        +{formatCredits(amount)}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-dash-ink">
                    Fechas del periodo
                  </h4>
                  <p className="text-xs text-dash-muted mt-1 mb-3">
                    Úsalas si el cobro ya pasó y hay que alinear el ciclo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-xs font-medium text-dash-muted mb-1">
                        Inicio
                      </span>
                      <input
                        type="date"
                        value={activatedAtLocal}
                        onChange={(e) => setActivatedAtLocal(e.target.value)}
                        disabled={saving}
                        className="h-11 w-full rounded-xl border border-dash-line bg-dash-surface px-3 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-dash-muted mb-1">
                        Vence
                      </span>
                      <input
                        type="date"
                        value={currentPeriodEndLocal}
                        onChange={(e) =>
                          setCurrentPeriodEndLocal(e.target.value)
                        }
                        disabled={saving}
                        className="h-11 w-full rounded-xl border border-dash-line bg-dash-surface px-3 text-sm"
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-dash-ink">
                    Qué incluye este plan
                  </h4>
                  <p className="text-xs text-dash-muted mt-1 mb-3">
                    Activa o quita módulos. El cambio aplica al instante para
                    esa empresa.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FEATURE_KEYS.map((key) => {
                      const meta = PLAN_FEATURES_MAP[key as PlanFeatureKey];
                      const checked = Boolean(draft[key]);
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-3 rounded-xl border border-dash-line bg-dash-surface-2 px-3 py-3 cursor-pointer min-h-11"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={saving}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="mt-1 h-4 w-4 accent-orange-500"
                          />
                          <span>
                            <span className="block text-sm font-medium text-dash-ink">
                              {meta?.name ?? key}
                            </span>
                            {meta?.description ? (
                              <span className="block text-xs text-dash-muted mt-0.5">
                                {meta.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1 pb-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 rounded-full px-4 text-sm font-semibold border border-dash-line cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={saving || Boolean(creditsToAddError)}
                    onClick={async () => {
                      await onSave({
                        subscriptionId: subscription.id,
                        planFeaturesPayload: FEATURE_KEYS.map((key) => ({
                          key,
                          included: Boolean(draft[key]),
                        })),
                        activatedAt: calendarDayOrNull(activatedAtLocal),
                        currentPeriodEnd: calendarDayOrNull(
                          currentPeriodEndLocal,
                        ),
                        creditsToAdd: hasCreditsToAdd
                          ? parsedCreditsToAdd
                          : undefined,
                      });
                    }}
                    className="h-11 rounded-full dash-grad-accent hover:shadow-dash-accent-lift text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer shadow-dash-accent"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
