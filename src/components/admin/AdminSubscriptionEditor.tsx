"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type PlanFeatureKey,
  PLAN_FEATURE_KEYS,
  PLAN_FEATURES_MAP,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import type { AdminSubscriptionRow } from "./types";
import {
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
  }) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [activatedAtLocal, setActivatedAtLocal] = useState("");
  const [currentPeriodEndLocal, setCurrentPeriodEndLocal] = useState("");
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  useEffect(() => {
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
    setHydratedId(subscription.id);
  }, [hydratedId, isOpen, subscription]);

  const contact = subscription?.company?.users?.[0];
  const statusLabel =
    SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === subscription?.status)
      ?.label ?? "Sin estado";

  return (
    <AnimatePresence>
      {isOpen && subscription ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-[#1e1e1e] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#212121] dark:text-white">
                    {subscription.company?.name ?? "Empresa sin nombre"}
                  </h3>
                  <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
                    {formatPersonName(contact?.name, contact?.lastName)}
                    {contact?.email ? ` · ${contact.email}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 w-11 rounded-xl text-2xl text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] cursor-pointer"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="px-4 sm:px-6 py-5 flex flex-col gap-5">
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Plan
                    </p>
                    <p className="mt-1 font-semibold text-[#212121] dark:text-white">
                      {subscription.planName ?? "—"}
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                      {formatMoney(
                        subscription.planCost,
                        subscription.planCurrency,
                      )}{" "}
                      {formatPlanFrequency(subscription.planFrequency)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Estado
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        SUBSCRIPTION_STATUS_CLASSES[subscription.status ?? ""] ??
                        "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-2">
                      Límite: {subscription.planLeadLimit ?? "—"} leads
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Periodo actual
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#212121] dark:text-white">
                      {formatDateShort(subscription.activatedAt, false)} →{" "}
                      {formatDateShort(subscription.currentPeriodEnd, false)}
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                    Fechas del periodo
                  </h4>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                    Úsalas si el cobro ya pasó y hay que alinear el ciclo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
                        Inicio
                      </span>
                      <input
                        type="date"
                        value={activatedAtLocal}
                        onChange={(e) => setActivatedAtLocal(e.target.value)}
                        disabled={saving}
                        className="h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
                        Vence
                      </span>
                      <input
                        type="date"
                        value={currentPeriodEndLocal}
                        onChange={(e) =>
                          setCurrentPeriodEndLocal(e.target.value)
                        }
                        disabled={saving}
                        className="h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm"
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                    Qué incluye este plan
                  </h4>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                    Activa o quita módulos. El cambio aplica al instante para esa empresa.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FEATURE_KEYS.map((key) => {
                      const meta = PLAN_FEATURES_MAP[key as PlanFeatureKey];
                      const checked = Boolean(draft[key]);
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 py-3 cursor-pointer min-h-11"
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
                            <span className="block text-sm font-medium text-[#212121] dark:text-white">
                              {meta?.name ?? key}
                            </span>
                            {meta?.description ? (
                              <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
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
                    className="h-11 rounded-xl px-4 text-sm font-semibold border border-[#e0e0e0] dark:border-[#3a3a3a] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
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
                      });
                    }}
                    className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
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
