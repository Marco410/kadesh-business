"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type PlanFeatureKey,
  PLAN_FEATURES_MAP,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import { AdminCompanyUserRow, CompanySubscriptionRow } from "./types";

function normalizePlanFeatures(
  value: unknown,
): Array<{ key: string; included?: boolean | null }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { key: string; included?: boolean | null } => Boolean(v && (v as any).key))
    .map((v) => ({ key: String(v.key), included: v.included ?? null }));
}

export function getLatestSubscription(
  subscriptions: CompanySubscriptionRow[],
): CompanySubscriptionRow | null {
  if (!subscriptions || subscriptions.length === 0) return null;
  const sorted = [...subscriptions].sort((a, b) => {
    const aTime = new Date(a.currentPeriodEnd ?? a.activatedAt ?? 0).getTime();
    const bTime = new Date(b.currentPeriodEnd ?? b.activatedAt ?? 0).getTime();
    return bTime - aTime;
  });
  return sorted[0] ?? null;
}

function formatMoney(amount: number | null, currency: string | null) {
  if (amount == null) return "—";
  const c = currency ?? "MXN";
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

export function AdminCompanySubscriptionsModal({
  isOpen,
  onClose,
  user,
  featureKeys,
  onSaveFeatures,
  savingSubscriptionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: AdminCompanyUserRow | null;
  featureKeys: string[];
  savingSubscriptionId: string | null;
  onSaveFeatures: (args: {
    subscriptionId: string;
    planFeaturesPayload: Array<{ key: string; included: boolean }>;
    activatedAt?: string | null;
    currentPeriodEnd?: string | null;
  }) => Promise<void>;
}) {
  const subscriptions = user?.company?.subscriptions ?? [];
  const latest = getLatestSubscription(subscriptions);

  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const selected =
    subscriptions.find((s) => s.id && s.id === selectedSubscriptionId) ??
    (latest?.id ? latest : null);

  const selectedId = selected?.id ?? null;
  const isSaving = selectedId != null && savingSubscriptionId === selectedId;

  const [draftForSubscriptionId, setDraftForSubscriptionId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [activatedAtLocal, setActivatedAtLocal] = useState<string>("");
  const [currentPeriodEndLocal, setCurrentPeriodEndLocal] = useState<string>("");

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
    if (!v) return null;
    // Expect YYYY-MM-DD (CalendarDay)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    return v;
  }

  useEffect(() => {
    if (!isOpen) return;
    if (!selectedId) {
      setDraftForSubscriptionId(null);
      setDraft({});
      setActivatedAtLocal("");
      setCurrentPeriodEndLocal("");
      return;
    }
    if (draftForSubscriptionId === selectedId) return;

    const fromSub = normalizePlanFeatures(selected?.planFeatures);
    const next: Record<string, boolean> = {};
    for (const key of featureKeys) {
      next[key] = fromSub.find((f) => f.key === key)?.included ?? false;
    }
    setDraftForSubscriptionId(selectedId);
    setDraft(next);
    setActivatedAtLocal(toCalendarDay(selected?.activatedAt ?? null));
    setCurrentPeriodEndLocal(toCalendarDay(selected?.currentPeriodEnd ?? null));
  }, [draftForSubscriptionId, featureKeys, isOpen, selected?.planFeatures, selectedId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#212121] dark:text-[#ffffff] pr-4">
                    Suscripciones:{" "}
                    {[user?.name, user?.lastName, user?.secondLastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </h3>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                    {user?.email ?? "—"} · {user?.company?.name ?? "—"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <section className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-4 lg:col-span-1">
                  <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
                    Resumen
                  </h4>
                  <div className="text-sm text-[#212121] dark:text-white space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        Suscripciones
                      </span>
                      <span className="font-semibold">{subscriptions.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        Última suscripción
                      </span>
                      <span className="font-semibold">{latest?.planName ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">Periodo</span>
                      <span className="font-semibold">
                        {latest?.activatedAt
                          ? `${formatDateShort(latest.activatedAt, false)} → ${formatDateShort(
                              latest.currentPeriodEnd,
                              false,
                            )}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">Monto</span>
                      <span className="font-semibold">
                        {formatMoney(latest?.planCost ?? null, latest?.planCurrency ?? null)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                    <label className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-2">
                      Seleccionar suscripción
                    </label>
                    <select
                      className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-[#212121] dark:text-white"
                      value={selectedSubscriptionId ?? (latest?.id ?? "")}
                      onChange={(e) => setSelectedSubscriptionId(e.target.value || null)}
                      disabled={subscriptions.length === 0}
                    >
                      {subscriptions.length === 0 ? (
                        <option value="">Sin suscripciones</option>
                      ) : (
                        subscriptions
                          .filter((s) => s.id)
                          .map((s) => {
                            const label = `${s.planName ?? "Plan"} · ${formatDateShort(
                              s.activatedAt,
                              false,
                            )} → ${formatDateShort(s.currentPeriodEnd, false)}`;
                            return (
                              <option key={s.id ?? label} value={s.id ?? ""}>
                                {label}
                              </option>
                            );
                          })
                      )}
                    </select>
                  </div>
                </section>

                <section className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 lg:col-span-2">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                        Plan features por suscripción
                      </h4>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                        Edita fechas y features en la suscripción seleccionada y guarda.
                      </p>
                    </div>
                    {selected?.status ? (
                      <span
                        className={`text-center inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-sm font-medium ${
                          SUBSCRIPTION_STATUS_CLASSES[selected.status ?? ""] ??
                          "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
                        }`}
                      >
                        {SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === selected.status)
                          ?.label ?? "Inactivo"}
                      </span>
                    ) : null}
                  </div>

                  {!selectedId ? (
                    <div className="rounded-xl border border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] p-6 text-sm text-[#616161] dark:text-[#b0b0b0] text-center">
                      No hay suscripción seleccionada.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <label className="block">
                          <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
                            activatedAt
                          </span>
                          <input
                            type="date"
                            value={activatedAtLocal}
                            onChange={(e) => setActivatedAtLocal(e.target.value)}
                            disabled={isSaving}
                            className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-[#212121] dark:text-white"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
                            currentPeriodEnd
                          </span>
                          <input
                            type="date"
                            value={currentPeriodEndLocal}
                            onChange={(e) => setCurrentPeriodEndLocal(e.target.value)}
                            disabled={isSaving}
                            className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-[#212121] dark:text-white"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {featureKeys.map((key) => {
                          const meta = PLAN_FEATURES_MAP[key as PlanFeatureKey] ?? null;
                          const checked = Boolean((draft as any)[key]);
                          return (
                            <label
                              key={`${selectedId}-${key}`}
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-2 py-1 cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 transition-colors"
                              title={meta?.description ?? ""}
                            >
                              <input
                                type="checkbox"
                                aria-label={meta?.name ?? key}
                                checked={checked}
                                disabled={isSaving}
                                onChange={(e) => {
                                  const next = e.target.checked;
                                  setDraft((prev) => ({ ...prev, [key]: next } as any));
                                }}
                              />
                              <span className="text-xs text-[#212121] dark:text-white">
                                {meta?.name ?? key}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                          ID: <span className="font-mono">{selectedId}</span>
                        </div>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            const payload = featureKeys.map((k) => ({
                              key: k,
                              included: Boolean((draft as any)[k]),
                            }));
                            await onSaveFeatures({
                              subscriptionId: selectedId,
                              planFeaturesPayload: payload,
                              activatedAt: calendarDayOrNull(activatedAtLocal),
                              currentPeriodEnd: calendarDayOrNull(currentPeriodEndLocal),
                            });
                          }}
                          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                              Guardando...
                            </span>
                          ) : (
                            "Guardar cambios"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

