"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_PLANS_QUERY,
  UPDATE_ADMIN_PLAN_MUTATION,
  type AdminPlansResponse,
} from "./queries";
import { PLAN_FILTERS } from "./constants";
import type { AdminPlanRow } from "./types";
import { countIncluded } from "./planFeatures";
import AdminPlanEditor, { type AdminPlanSavePayload } from "./AdminPlanEditor";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminStatusBadge,
  formatCredits,
  formatMoney,
  formatPlanFrequency,
  surfaceClass,
} from "./ui";

type PlanFilter = (typeof PLAN_FILTERS)[number]["value"];

export default function AdminPlansPanel() {
  const [filter, setFilter] = useState<PlanFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const where = useMemo(() => {
    if (filter === "active") return { active: { equals: true } };
    if (filter === "inactive") return { active: { equals: false } };
    return {};
  }, [filter]);

  const { data, loading, error } = useQuery<AdminPlansResponse>(
    ADMIN_PLANS_QUERY,
    { variables: { where }, fetchPolicy: "network-only" },
  );

  const [updatePlan] = useMutation(UPDATE_ADMIN_PLAN_MUTATION, {
    refetchQueries: [{ query: ADMIN_PLANS_QUERY, variables: { where } }],
  });

  const plans = data?.saasPlans ?? [];
  const selected = plans.find((p) => p.id === selectedId) ?? null;

  async function handleSave({ planId, data: payload }: AdminPlanSavePayload) {
    setSaving(true);
    try {
      await updatePlan({ variables: { where: { id: planId }, data: payload } });
      sileo.success({ title: "Plan actualizado" });
      setSelectedId(null);
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar el plan",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPlanEditor
        isOpen={Boolean(selectedId)}
        plan={selected}
        saving={saving}
        onClose={() => {
          if (!saving) setSelectedId(null);
        }}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          El catálogo que se ve en precios y al contratar. Los cambios de precio
          se verifican contra Stripe antes de guardar.
        </p>
        <AdminFilterChips
          label="Planes"
          options={[...PLAN_FILTERS]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar los planes." />
      ) : loading && plans.length === 0 ? (
        <AdminLoadingRows rows={4} />
      ) : plans.length === 0 ? (
        <AdminEmptyState
          title="No hay planes con ese filtro"
          description="Cambia el filtro para ver el resto del catálogo."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setSelectedId(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
}: {
  plan: AdminPlanRow;
  onEdit: () => void;
}) {
  const features = countIncluded(plan.planFeatures);
  const hasStripe = Boolean(plan.stripePriceId);

  return (
    <article className={`${surfaceClass} p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#212121] dark:text-white">
              {plan.name ?? "Plan sin nombre"}
            </h3>
            {plan.bestSeller ? (
              <AdminStatusBadge
                label="Más vendido"
                className="bg-orange-500/15 text-orange-700 dark:text-orange-300"
              />
            ) : null}
            <AdminStatusBadge
              label={plan.active ? "Visible" : "Apagado"}
              className={
                plan.active
                  ? "bg-green-500/15 text-green-700 dark:text-green-400"
                  : "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
              }
            />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#212121] dark:text-white">
            {formatMoney(plan.cost, plan.currency)}
            <span className="ml-1 text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              {formatPlanFrequency(plan.frequency)}
            </span>
          </p>
          {plan.costOld ? (
            <p className="text-xs text-[#9e9e9e] line-through">
              {formatMoney(plan.costOld, plan.currency)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="h-11 shrink-0 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-xs font-semibold hover:border-orange-300 cursor-pointer"
        >
          Editar plan
        </button>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
          <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            Créditos
          </dt>
          <dd className="mt-1 font-semibold text-[#212121] dark:text-white">
            {formatCredits(plan.leadLimit)}
          </dd>
        </div>
        <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
          <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            Módulos
          </dt>
          <dd className="mt-1 font-semibold text-[#212121] dark:text-white">
            {features.included}/{features.total}
          </dd>
        </div>
        <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
          <dt className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            Empresas
          </dt>
          <dd className="mt-1 font-semibold text-[#212121] dark:text-white">
            {plan.subscriptionsCount ?? 0}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
        <span
          className={
            hasStripe ? "" : "text-amber-700 dark:text-amber-300 font-medium"
          }
        >
          {hasStripe ? "Ligado a Stripe" : "Sin precio de Stripe"}
        </span>
        {plan.updatedAt ? (
          <span>Editado {formatDateShort(plan.updatedAt, false)}</span>
        ) : null}
      </div>
    </article>
  );
}
