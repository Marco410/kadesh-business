"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import {
  ADMIN_PLANS_QUERY,
  UPDATE_PLAN_FEATURE_CATALOG_MUTATION,
  type AdminPlansResponse,
  type UpdatePlanFeatureCatalogResponse,
} from "./queries";
import type { AdminPlanRow } from "./types";
import {
  deriveSharedFeatureCatalog,
  planNamesIncludingFeature,
  type PlanFeatureEntry,
} from "./planFeatures";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminSearchInput,
  AdminStatusBadge,
  surfaceClass,
} from "./ui";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const labelClass =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1";

/**
 * Nombre y descripción globales: lista + editor (no una tarjeta por módulo).
 * Al guardar se sincroniza en todos los planes y suscripciones.
 */
export default function AdminPlanModulesPanel() {
  const { data, loading, error } = useQuery<AdminPlansResponse>(
    ADMIN_PLANS_QUERY,
    { variables: { where: {} }, fetchPolicy: "network-only" },
  );
  const [formEpoch, setFormEpoch] = useState(0);

  if (error) {
    return <AdminErrorState message="No se pudieron cargar los módulos." />;
  }

  if (loading && !data) {
    return <AdminLoadingRows rows={6} />;
  }

  const plans = data?.saasPlans ?? [];
  const catalog = deriveSharedFeatureCatalog(plans);
  if (catalog.length === 0) {
    return (
      <AdminEmptyState
        title="No hay módulos en el catálogo"
        description="Cuando haya planes con features, aparecerán aquí."
      />
    );
  }

  return (
    <AdminPlanModulesForm
      key={`${formEpoch}-${catalog.map((f) => f.key).join(",")}`}
      initial={catalog}
      plans={plans}
      onSaved={() => setFormEpoch((n) => n + 1)}
    />
  );
}

function AdminPlanModulesForm({
  initial,
  plans,
  onSaved,
}: {
  initial: PlanFeatureEntry[];
  plans: AdminPlanRow[];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(() => initial.map((f) => ({ ...f })));
  const [selectedKey, setSelectedKey] = useState(initial[0]?.key ?? "");
  const [search, setSearch] = useState("");
  const [mobileEditing, setMobileEditing] = useState(false);

  const [updateCatalog, { loading: saving }] =
    useMutation<UpdatePlanFeatureCatalogResponse>(
      UPDATE_PLAN_FEATURE_CATALOG_MUTATION,
      {
        refetchQueries: [
          { query: ADMIN_PLANS_QUERY, variables: { where: {} } },
        ],
      },
    );

  const initialByKey = useMemo(() => {
    const map = new Map(initial.map((f) => [f.key, f]));
    return map;
  }, [initial]);

  const dirtyKeys = useMemo(() => {
    const dirty = new Set<string>();
    for (const f of draft) {
      const orig = initialByKey.get(f.key);
      if (!orig) continue;
      if (
        f.name.trim() !== orig.name.trim() ||
        f.description.trim() !== orig.description.trim()
      ) {
        dirty.add(f.key);
      }
    }
    return dirty;
  }, [draft, initialByKey]);

  const isDirty = dirtyKeys.size > 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return draft;
    return draft.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q),
    );
  }, [draft, search]);

  const selected =
    draft.find((f) => f.key === selectedKey) ?? filtered[0] ?? draft[0] ?? null;

  const includedIn = selected
    ? planNamesIncludingFeature(plans, selected.key)
    : [];

  function patch(
    key: string,
    next: Partial<Pick<PlanFeatureEntry, "name" | "description">>,
  ) {
    setDraft((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...next } : f)),
    );
  }

  function selectModule(key: string) {
    setSelectedKey(key);
    setMobileEditing(true);
  }

  function discard() {
    setDraft(initial.map((f) => ({ ...f })));
  }

  const selectedEmptyName = Boolean(selected && selected.name.trim() === "");
  const anyEmptyName = draft.some((f) => f.name.trim() === "");

  async function handleSave() {
    if (anyEmptyName) {
      sileo.error({ title: "Cada módulo necesita un nombre" });
      return;
    }
    try {
      const result = await updateCatalog({
        variables: {
          input: {
            features: draft.map((f) => ({
              key: f.key,
              name: f.name.trim(),
              description: f.description.trim(),
            })),
          },
        },
      });
      const payload = result.data?.updatePlanFeatureCatalog;
      if (!payload?.success) {
        sileo.error({
          title: "No se pudieron guardar los módulos",
          description: payload?.message ?? "Intenta de nuevo.",
        });
        return;
      }
      sileo.success({ title: payload.message || "Módulos actualizados" });
      onSaved();
    } catch (err) {
      sileo.error({
        title: "No se pudieron guardar los módulos",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Texto único para precios y todos los planes. Elige un módulo, edítalo y
        guarda cuando termines.
      </p>

      <div
        className={cn(
          surfaceClass,
          "overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(240px,320px)_1fr] lg:min-h-[520px]",
        )}
      >
        {/* Lista */}
        <div
          className={cn(
            "flex flex-col border-[#e0e0e0] dark:border-[#3a3a3a] lg:border-r",
            mobileEditing ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="p-3 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar módulo"
            />
            <p className="mt-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
              {filtered.length} de {draft.length}
              {dirtyKeys.size > 0
                ? ` · ${dirtyKeys.size} sin guardar`
                : ""}
            </p>
          </div>
          <ul
            className="flex-1 overflow-y-auto max-h-[50vh] lg:max-h-none divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]"
            role="listbox"
            aria-label="Módulos"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-sm text-center text-[#616161] dark:text-[#b0b0b0]">
                Ningún módulo coincide con la búsqueda.
              </li>
            ) : (
              filtered.map((f) => {
                const active = f.key === selected?.key;
                const dirty = dirtyKeys.has(f.key);
                return (
                  <li key={f.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => selectModule(f.key)}
                      className={cn(
                        "w-full text-left px-4 py-3 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400",
                        active
                          ? "bg-orange-500/10"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
                      )}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-sm font-semibold truncate",
                              active
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-[#212121] dark:text-white",
                            )}
                          >
                            {f.name || "Sin nombre"}
                          </span>
                          <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5 line-clamp-2">
                            {f.description || "Sin descripción"}
                          </span>
                        </span>
                        {dirty ? (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                            title="Cambios sin guardar"
                            aria-label="Cambios sin guardar"
                          />
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Editor */}
        <div
          className={cn(
            "flex flex-col min-h-[320px]",
            mobileEditing ? "flex" : "hidden lg:flex",
          )}
        >
          {selected ? (
            <>
              <div className="px-4 sm:px-5 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMobileEditing(false)}
                  className="lg:hidden h-11 w-11 shrink-0 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] inline-flex items-center justify-center cursor-pointer"
                  aria-label="Volver a la lista"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-[#212121] dark:text-white truncate">
                    {selected.name || "Sin nombre"}
                  </h2>
                  {includedIn.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-xs text-[#616161] dark:text-[#b0b0b0] self-center mr-0.5">
                        Incluido en
                      </span>
                      {includedIn.map((name) => (
                        <AdminStatusBadge
                          key={name}
                          label={name}
                          className="bg-black/5 dark:bg-white/10 text-[#616161] dark:text-[#b0b0b0]"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-[#9e9e9e]">
                      Ningún plan lo tiene incluido todavía
                    </p>
                  )}
                </div>
                {dirtyKeys.has(selected.key) ? (
                  <AdminStatusBadge
                    label="Editado"
                    className="bg-orange-500/15 text-orange-700 dark:text-orange-300 shrink-0"
                  />
                ) : null}
              </div>

              <div className="flex-1 px-4 sm:px-5 py-5 flex flex-col gap-4">
                <label className="block">
                  <span className={labelClass}>Nombre</span>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) =>
                      patch(selected.key, { name: e.target.value })
                    }
                    disabled={saving}
                    className={fieldClass}
                    autoFocus
                  />
                  {selectedEmptyName ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      El nombre no puede quedar vacío.
                    </p>
                  ) : null}
                </label>
                <label className="block flex-1">
                  <span className={labelClass}>Descripción</span>
                  <textarea
                    value={selected.description}
                    onChange={(e) =>
                      patch(selected.key, { description: e.target.value })
                    }
                    disabled={saving}
                    rows={5}
                    className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 resize-y min-h-[8rem]"
                  />
                  <p className="mt-1.5 text-xs text-[#9e9e9e]">
                    Este texto se ve igual en Free, Starter, Pro y Agencia.
                  </p>
                </label>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Elige un módulo de la lista.
            </div>
          )}
        </div>
      </div>

      {/* Barra de acciones siempre visible */}
      <div
        className={cn(
          surfaceClass,
          "sticky bottom-3 z-10 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-lg",
          isDirty && "border-orange-300 dark:border-orange-600",
        )}
      >
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          {isDirty
            ? `${dirtyKeys.size} módulo${dirtyKeys.size === 1 ? "" : "s"} con cambios. Se aplican a todos los planes.`
            : "Sin cambios pendientes."}
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={discard}
            disabled={saving || !isDirty}
            className="h-11 rounded-xl px-4 text-sm font-semibold border border-[#e0e0e0] dark:border-[#3a3a3a] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Descartar
          </button>
          <button
            type="button"
            disabled={saving || !isDirty || anyEmptyName}
            onClick={() => void handleSave()}
            className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar en todos los planes"}
          </button>
        </div>
      </div>
    </div>
  );
}
