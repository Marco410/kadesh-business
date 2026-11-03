"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DASH_EASE } from "kadesh/components/app-shell";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import type { StripePlanCheckResult } from "./types";

/**
 * Antes de guardar un cambio de precio: comparativo entre lo que está por
 * guardarse en Kadesh y lo que Stripe tiene en ese price. Kadesh nunca escribe
 * en Stripe; el admin confirma o cancela.
 */
export default function AdminStripeCheckDialog({
  isOpen,
  planName,
  loading,
  result,
  error,
  saving,
  onRetry,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  planName: string;
  loading: boolean;
  result: StripePlanCheckResult | null;
  error: string | null;
  saving: boolean;
  onRetry: () => void;
  onClose: () => void;
  /** Sin handler, el diálogo es solo de consulta (no ofrece guardar). */
  onConfirm?: () => void;
}) {
  const mismatches = result?.fields.filter((f) => !f.match) ?? [];
  const blocked = Boolean(error) || result?.success === false;

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div data-body-scroll-lock
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]"
            onClick={saving ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: DASH_EASE }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Verificar ${planName} con Stripe`}
              className="bg-dash-surface rounded-t-3xl sm:rounded-3xl shadow-dash-lift font-dash text-dash-ink w-full max-w-2xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-dash-line"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 py-4 border-b border-dash-line">
                <h3 className="text-lg font-bold text-dash-ink">
                  Verificar {planName} con Stripe
                </h3>
                <p className="text-sm text-dash-muted mt-1">
                  Así se ve este plan en Kadesh y así está en Stripe. Nada se
                  guarda hasta que confirmes.
                </p>
              </div>

              <div className="px-4 sm:px-6 py-5">
                {loading ? (
                  <div className="flex items-center justify-center gap-3 py-10">
                    <span className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
                    <span className="text-sm text-dash-muted">
                      Consultando Stripe...
                    </span>
                  </div>
                ) : blocked ? (
                  <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      No se pudo verificar
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error ?? result?.message}
                    </p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-3 h-11 rounded-xl border border-red-300 dark:border-red-700 px-4 text-sm font-semibold text-red-700 dark:text-red-300 cursor-pointer"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : result ? (
                  <div className="flex flex-col gap-4">
                    <div
                      className={`flex items-start gap-3 rounded-xl p-4 ${
                        result.allMatch
                          ? "bg-green-500/10 text-green-800 dark:text-green-300"
                          : "bg-amber-500/10 text-amber-900 dark:text-amber-200"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={
                          result.allMatch ? CheckmarkCircle02Icon : Alert02Icon
                        }
                        size={20}
                        className="mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {result.allMatch
                            ? "Todo coincide con Stripe"
                            : `${mismatches.length} ${
                                mismatches.length === 1
                                  ? "dato no coincide"
                                  : "datos no coinciden"
                              }`}
                        </p>
                        {!result.allMatch ? (
                          <p className="text-sm mt-1">
                            Los precios de Stripe no se pueden editar: crea uno
                            nuevo en Stripe y pega su ID aquí antes de guardar.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-dash-line">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-dash-muted bg-dash-surface-2 text-[12px] font-semibold uppercase tracking-[0.04em]">
                            <th className="px-3 py-2 font-medium">Dato</th>
                            <th className="px-3 py-2 font-medium">
                              Vas a guardar
                            </th>
                            <th className="px-3 py-2 font-medium">En Stripe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.fields.map((f) => (
                            <tr
                              key={f.field}
                              className="border-t border-dash-line"
                            >
                              <td className="px-3 py-2.5 text-dash-muted">
                                {f.label}
                              </td>
                              <td className="px-3 py-2.5 font-medium text-dash-ink break-all">
                                {f.local ?? "—"}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`inline-flex items-start gap-1.5 font-medium break-all ${
                                    f.match
                                      ? "text-dash-ink"
                                      : "text-red-700 dark:text-red-400"
                                  }`}
                                >
                                  <HugeiconsIcon
                                    icon={
                                      f.match
                                        ? CheckmarkCircle02Icon
                                        : CancelCircleIcon
                                    }
                                    size={16}
                                    className="mt-0.5 shrink-0"
                                  />
                                  {f.stripe ?? "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dash-muted">
                      {result.productName ? (
                        <span>Producto: {result.productName}</span>
                      ) : null}
                      <span>
                        Modo: {result.livemode ? "producción" : "pruebas"}
                      </span>
                      {result.subscriptionsCount != null ? (
                        <span>
                          {result.subscriptionsCount} suscripción
                          {result.subscriptionsCount === 1 ? "" : "es"} activa
                          {result.subscriptionsCount === 1 ? "" : "s"} en este
                          precio
                        </span>
                      ) : null}
                    </div>

                    {!result.allMatch && result.subscriptionsCount ? (
                      <p className="text-xs text-dash-muted">
                        Quien ya está suscrito sigue pagando lo que dice Stripe,
                        no lo que guardes aquí. Guardar solo cambia lo que se
                        muestra y lo que se cobra a quien contrate de ahora en
                        adelante.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="px-4 sm:px-6 py-4 border-t border-dash-line flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-11 rounded-full px-4 text-sm font-semibold border border-dash-line cursor-pointer disabled:opacity-60"
                >
                  {onConfirm ? "Cancelar" : "Cerrar"}
                </button>
                {onConfirm ? (
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading || saving || blocked}
                    className="h-11 rounded-full dash-grad-accent hover:shadow-dash-accent-lift text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer shadow-dash-accent"
                  >
                    {saving
                      ? "Guardando..."
                      : result?.allMatch
                        ? "Guardar plan"
                        : "Guardar de todas formas"}
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
