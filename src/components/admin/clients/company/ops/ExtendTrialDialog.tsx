"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import { AdminDrawer } from "../../../ui";
import { ADMIN_EXTEND_TRIAL_MUTATION, type AdminOpsActionResult } from "../../ops-queries";

const QUICK_DAYS = [7, 14, 30] as const;

/**
 * Extender la prueba gratuita: suma días al fin actual (o a hoy si ya venció) o fija una fecha.
 * Si la prueba había vencido, la empresa vuelve a "en prueba" y recupera el acceso a extraer.
 */
export default function ExtendTrialDialog({
  open,
  companyId,
  companyName,
  trialEnd,
  onClose,
  onDone,
}: {
  open: boolean;
  companyId: string;
  companyName: string;
  trialEnd: string | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [until, setUntil] = useState("");
  const [extend, { loading }] = useMutation<{ adminExtendTrial: AdminOpsActionResult }>(
    ADMIN_EXTEND_TRIAL_MUTATION,
  );

  const run = async (variables: { days?: number; until?: string }) => {
    try {
      const { data } = await extend({ variables: { companyId, ...variables } });
      const outcome = data?.adminExtendTrial;
      if (!outcome?.success) {
        sileo.error({ title: outcome?.message ?? "No se pudo extender la prueba" });
        return;
      }
      sileo.success({ title: outcome.message });
      setUntil("");
      onDone();
    } catch (error) {
      sileo.error({ title: error instanceof Error ? error.message : "No se pudo extender la prueba" });
    }
  };

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      ariaLabel="Extender prueba"
      title="Extender prueba"
      subtitle={companyName}
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-dash-muted">
          {trialEnd
            ? `La prueba termina (o terminó) el ${formatDateShort(trialEnd, false)}.`
            : "La prueba no tiene fecha de fin guardada."}{" "}
          Los días se suman desde esa fecha, o desde hoy si ya venció. Queda registrado en
          Actividad.
        </p>

        <div>
          <p className="text-xs font-medium text-dash-muted">Sumar días</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {QUICK_DAYS.map((days) => (
              <button
                key={days}
                type="button"
                disabled={loading}
                onClick={() => run({ days })}
                className="h-11 rounded-full border border-dash-line text-sm font-semibold text-dash-ink hover:border-orange-300 disabled:opacity-60 cursor-pointer"
              >
                +{days} días
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (until) run({ until });
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="extend-trial-until" className="text-xs font-medium text-dash-muted">
            O hasta una fecha
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="extend-trial-until"
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="h-11 flex-1 rounded-xl border border-dash-line bg-dash-surface px-3 text-sm text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            />
            <button
              type="submit"
              disabled={loading || !until}
              className="h-11 rounded-full dash-grad-accent px-5 text-sm font-semibold text-white hover:shadow-dash-accent-lift disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-dash-accent"
            >
              Extender
            </button>
          </div>
        </form>
      </div>
    </AdminDrawer>
  );
}
