"use client";

import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import {
  STRIPE_PLAN_CHECK_QUERY,
  type StripePlanCheckResponse,
} from "./queries";
import { PLAN_FREQUENCY_OPTIONS } from "./constants";
import type { AdminPlanDraft, AdminPlanRow } from "./types";
import {
  mergePlanFeatures,
  toPlanFeaturesPayload,
  type PlanFeatureEntry,
} from "./planFeatures";
import AdminStripeCheckDialog from "./AdminStripeCheckDialog";
import { formatCredits, formatMoney, formatPlanFrequency } from "./ui";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const labelClass =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1";

function numberToInput(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function inputToNumber(value: string): number | null {
  const v = value.trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildDraft(plan: AdminPlanRow, features: PlanFeatureEntry[]): AdminPlanDraft {
  return {
    name: plan.name ?? "",
    cost: numberToInput(plan.cost),
    costOld: numberToInput(plan.costOld),
    currency: plan.currency ?? "mxn",
    frequency: plan.frequency ?? "monthly",
    leadLimit: numberToInput(plan.leadLimit),
    active: plan.active ?? false,
    bestSeller: plan.bestSeller ?? false,
    referralUpfrontCommissionPct: numberToInput(
      plan.referralUpfrontCommissionPct,
    ),
    referralRecurringCommissionPct: numberToInput(
      plan.referralRecurringCommissionPct,
    ),
    stripePriceId: plan.stripePriceId ?? "",
    stripeProductId: plan.stripeProductId ?? "",
    features: features.map((f) => ({ ...f })),
  };
}

export type AdminPlanSavePayload = {
  planId: string;
  data: Record<string, unknown>;
};

/**
 * Wrapper: remonta el form con `key={plan.id}` para hidratar el borrador
 * sin un effect (evita setState-en-effect del linter).
 */
export default function AdminPlanEditor({
  isOpen,
  plan,
  saving,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  plan: AdminPlanRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: AdminPlanSavePayload) => Promise<void>;
}) {
  if (!isOpen || !plan) return null;
  return (
    <AdminPlanEditorForm
      key={plan.id}
      plan={plan}
      saving={saving}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AdminPlanEditorForm({
  plan,
  saving,
  onClose,
  onSave,
}: {
  plan: AdminPlanRow;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: AdminPlanSavePayload) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminPlanDraft>(() =>
    buildDraft(plan, mergePlanFeatures(plan.planFeatures)),
  );
  /** "check" = solo consultar; "save" = verificar y luego guardar. */
  const [checkIntent, setCheckIntent] = useState<"check" | "save" | null>(null);

  const [runCheck, { data: checkData, loading: checking, error: checkError }] =
    useLazyQuery<StripePlanCheckResponse>(STRIPE_PLAN_CHECK_QUERY, {
      fetchPolicy: "network-only",
    });

  const set = <K extends keyof AdminPlanDraft>(
    key: K,
    value: AdminPlanDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  function patchFeature(
    featureKey: string,
    patch: Partial<Pick<PlanFeatureEntry, "name" | "description" | "included">>,
  ) {
    setDraft((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.key === featureKey ? { ...f, ...patch } : f,
      ),
    }));
  }

  const costNumber = inputToNumber(draft.cost);
  const billingChanged =
    costNumber !== (plan.cost ?? null) ||
    draft.currency.trim().toLowerCase() !==
      (plan.currency ?? "").trim().toLowerCase() ||
    draft.frequency !== (plan.frequency ?? "") ||
    draft.stripePriceId.trim() !== (plan.stripePriceId ?? "").trim();

  const nameError = draft.name.trim() === "" ? "Ponle un nombre al plan." : null;
  const costError =
    draft.cost.trim() !== "" && (costNumber == null || costNumber < 0)
      ? "El monto tiene que ser un número de 0 o más."
      : null;
  const includedCount = draft.features.filter((f) => f.included).length;
  const invalid = Boolean(nameError || costError);

  function checkVariables() {
    return {
      input: {
        planId: plan.id,
        stripePriceId: draft.stripePriceId.trim() || null,
        cost: inputToNumber(draft.cost),
        currency: draft.currency.trim() || null,
        frequency: draft.frequency || null,
      },
    };
  }

  function openCheck(intent: "check" | "save") {
    setCheckIntent(intent);
    runCheck({ variables: checkVariables() });
  }

  async function persist() {
    await onSave({
      planId: plan.id,
      data: {
        name: draft.name.trim(),
        cost: inputToNumber(draft.cost),
        costOld: inputToNumber(draft.costOld),
        currency: draft.currency.trim().toLowerCase(),
        frequency: draft.frequency,
        leadLimit: inputToNumber(draft.leadLimit),
        active: draft.active,
        bestSeller: draft.bestSeller,
        referralUpfrontCommissionPct: inputToNumber(
          draft.referralUpfrontCommissionPct,
        ),
        referralRecurringCommissionPct: inputToNumber(
          draft.referralRecurringCommissionPct,
        ),
        stripePriceId: draft.stripePriceId.trim() || null,
        stripeProductId: draft.stripeProductId.trim() || null,
        planFeatures: toPlanFeaturesPayload(draft.features),
      },
    });
    setCheckIntent(null);
  }

  return (
    <>
      <AdminStripeCheckDialog
        isOpen={checkIntent !== null}
        planName={draft.name || "este plan"}
        loading={checking}
        result={checkData?.stripePlanCheck ?? null}
        error={checkError ? checkError.message : null}
        saving={saving}
        onRetry={() => runCheck({ variables: checkVariables() })}
        onClose={() => {
          if (!saving) setCheckIntent(null);
        }}
        onConfirm={checkIntent === "save" ? persist : undefined}
      />

      <AnimatePresence>
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
            <div className="sticky top-0 z-10 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-[#212121] dark:text-white">
                  {plan.name ?? "Plan sin nombre"}
                </h3>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
                  {formatMoney(plan.cost, plan.currency)}{" "}
                  {formatPlanFrequency(plan.frequency)} ·{" "}
                  {plan.subscriptionsCount ?? 0} suscripción
                  {plan.subscriptionsCount === 1 ? "" : "es"}
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

            <div className="px-4 sm:px-6 py-5 flex flex-col gap-6">
              <section>
                <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
                  Nombre y visibilidad
                </h4>
                <label className="block">
                  <span className={labelClass}>Nombre</span>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    disabled={saving}
                    className={fieldClass}
                  />
                </label>
                {nameError ? (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {nameError}
                  </p>
                ) : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <label className="flex items-start gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 py-3 cursor-pointer min-h-11">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      disabled={saving}
                      onChange={(e) => set("active", e.target.checked)}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#212121] dark:text-white">
                        Visible para contratar
                      </span>
                      <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        Apagarlo lo quita de la página de precios. Quien ya lo
                        tiene no pierde nada.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 py-3 cursor-pointer min-h-11">
                    <input
                      type="checkbox"
                      checked={draft.bestSeller}
                      disabled={saving}
                      onChange={(e) => set("bestSeller", e.target.checked)}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#212121] dark:text-white">
                        Marcar como el más vendido
                      </span>
                      <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        Lo destaca en precios y en el panel del cliente.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                  Precio y cobro
                </h4>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                  Esto es lo que ve la gente en precios y lo que se cobra al
                  contratar. Cambiarlo pide verificar con Stripe.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>Monto</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={draft.cost}
                      onChange={(e) => set("cost", e.target.value)}
                      disabled={saving}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>
                      Precio tachado (opcional)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={draft.costOld}
                      onChange={(e) => set("costOld", e.target.value)}
                      disabled={saving}
                      placeholder="Para mostrar un descuento"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Moneda</span>
                    <input
                      type="text"
                      value={draft.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      disabled={saving}
                      placeholder="mxn"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Frecuencia</span>
                    <select
                      value={draft.frequency}
                      onChange={(e) => set("frequency", e.target.value)}
                      disabled={saving}
                      className={fieldClass}
                    >
                      {PLAN_FREQUENCY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className={labelClass}>Créditos al mes</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={draft.leadLimit}
                      onChange={(e) => set("leadLimit", e.target.value)}
                      disabled={saving}
                      className={fieldClass}
                    />
                  </label>
                </div>
                {costError ? (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {costError}
                  </p>
                ) : null}
                {billingChanged ? (
                  <div className="mt-3 flex items-start gap-3 rounded-xl bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                    <p className="text-xs">
                      Vas a cambiar el cobro. Al guardar te mostramos cómo está
                      este plan en Stripe para que lo confirmes.
                    </p>
                  </div>
                ) : null}
              </section>

              <section>
                <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                  Stripe
                </h4>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                  El precio de Stripe no se edita: si cambia el monto, crea uno
                  nuevo allá y pega su ID aquí.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>ID del precio</span>
                    <input
                      type="text"
                      value={draft.stripePriceId}
                      onChange={(e) => set("stripePriceId", e.target.value)}
                      disabled={saving}
                      placeholder="price_..."
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>ID del producto</span>
                    <input
                      type="text"
                      value={draft.stripeProductId}
                      onChange={(e) => set("stripeProductId", e.target.value)}
                      disabled={saving}
                      placeholder="prod_..."
                      className={fieldClass}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => openCheck("check")}
                  disabled={saving || !draft.stripePriceId.trim()}
                  className="mt-3 h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-sm font-semibold hover:border-orange-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Verificar con Stripe
                </button>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                  Comisión de referidos
                </h4>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                  Porcentaje que gana quien refiere. 20 = 20%.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>Primer pago</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      inputMode="decimal"
                      value={draft.referralUpfrontCommissionPct}
                      onChange={(e) =>
                        set("referralUpfrontCommissionPct", e.target.value)
                      }
                      disabled={saving}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Pagos recurrentes</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      inputMode="decimal"
                      value={draft.referralRecurringCommissionPct}
                      onChange={(e) =>
                        set("referralRecurringCommissionPct", e.target.value)
                      }
                      disabled={saving}
                      className={fieldClass}
                    />
                  </label>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                  Qué incluye este plan
                </h4>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                  {includedCount} de {draft.features.length} módulos incluidos.
                  El nombre y la descripción se editan una sola vez para todos
                  los planes, en Planes → Módulos.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {draft.features.map((f) => (
                    <label
                      key={f.key}
                      className="flex items-start gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 py-3 cursor-pointer min-h-11"
                    >
                      <input
                        type="checkbox"
                        checked={f.included}
                        disabled={saving}
                        onChange={(e) =>
                          patchFeature(f.key, { included: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 accent-orange-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-[#212121] dark:text-white">
                          {f.name}
                        </span>
                        {f.description ? (
                          <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {f.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                {formatCredits(inputToNumber(draft.leadLimit))} créditos ·{" "}
                {includedCount} módulos
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-11 rounded-xl px-4 text-sm font-semibold border border-[#e0e0e0] dark:border-[#3a3a3a] cursor-pointer disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving || invalid}
                  onClick={() => {
                    if (billingChanged) openCheck("save");
                    else void persist();
                  }}
                  className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {saving
                    ? "Guardando..."
                    : billingChanged
                      ? "Verificar y guardar"
                      : "Guardar plan"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
