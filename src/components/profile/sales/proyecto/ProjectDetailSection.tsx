"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  SAAS_PROJECT_QUERY,
  UPDATE_SAAS_PROJECT_MUTATION,
  type SaasProjectQueryResponse,
  type SaasProjectQueryVariables,
  type UpdateSaasProjectVariables,
  type UpdateSaasProjectMutation,
} from "kadesh/components/profile/sales/proyecto/queries";
import {
  PROJECT_STATUS_CLASSES,
  PROJECT_STATUS_OPTIONS,
} from "kadesh/components/profile/sales/constants";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { getCategoryLabel } from "../helpers/category";
import { sileo } from "sileo";

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-2 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0">
      <dt className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
        {label}
      </dt>
      <dd className="text-[#212121] dark:text-[#ffffff] min-w-0 break-words">
        {children ?? (value != null && value !== "" ? String(value) : "—")}
      </dd>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden shadow-sm">
      <h2 className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] bg-[#fafafa] dark:bg-[#252525] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
        {title}
      </h2>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

/** Convierte fecha (ISO o YYYY-MM-DD) a YYYY-MM-DD para input type="date". */
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName =
  "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

export default function ProjectDetailSection() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedEndDate, setEstimatedEndDate] = useState("");

  const { data, loading, error, refetch } = useQuery<
    SaasProjectQueryResponse,
    SaasProjectQueryVariables
  >(SAAS_PROJECT_QUERY, {
    variables: { where: { id } },
    skip: !id,
  });

  const project = data?.saasProject ?? null;

  useEffect(() => {
    if (!project) return;
    setName(project.name ?? "");
    setServiceType(project.serviceType ?? "");
    setStatus(project.status ?? "");
    setDescription(project.description ?? "");
    setStartDate(toDateInputValue(project.startDate));
    setEstimatedEndDate(toDateInputValue(project.estimatedEndDate));
  }, [project]);

  const [updateProject, { loading: saving }] = useMutation<
    UpdateSaasProjectMutation,
    UpdateSaasProjectVariables
  >(UPDATE_SAAS_PROJECT_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Proyecto actualizado." });
      setIsEditing(false);
      refetch();
    },
    onError: (err) => {
      sileo.error({ title: err.message ?? "Error al guardar." });
    },
  });

  function handleStartEdit() {
    if (project) {
      setName(project.name ?? "");
      setServiceType(project.serviceType ?? "");
      setStatus(project.status ?? "");
      setDescription(project.description ?? "");
      setStartDate(toDateInputValue(project.startDate));
      setEstimatedEndDate(toDateInputValue(project.estimatedEndDate));
      setIsEditing(true);
    }
  }

  function handleCancelEdit() {
    if (project) {
      setName(project.name ?? "");
      setServiceType(project.serviceType ?? "");
      setStatus(project.status ?? "");
      setDescription(project.description ?? "");
      setStartDate(toDateInputValue(project.startDate));
      setEstimatedEndDate(toDateInputValue(project.estimatedEndDate));
    }
    setIsEditing(false);
  }

  function handleSave() {
    if (!id) return;
    updateProject({
      variables: {
        where: { id },
        data: {
          name: name.trim() || null,
          serviceType: serviceType.trim() || null,
          status: status || null,
          description: description.trim() || null,
          startDate: startDate || null,
          estimatedEndDate: estimatedEndDate || null,
        },
      },
    });
  }

  if (!id) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-[#616161] dark:text-[#b0b0b0]">ID de proyecto no válido.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <span className="animate-spin size-10 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 text-center">
          <p className="text-[#616161] dark:text-[#b0b0b0] mb-4">
            {error?.message ?? "No se encontró el proyecto."}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            Volver
          </button>
        </div>
      </main>
    );
  }

  const statusClass =
    PROJECT_STATUS_CLASSES[project.status ?? ""] ??
    "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]";

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 mt-20">
      <div className="mb-6">
        <Link
          href={project.businessLead?.id ? Routes.panelLead(project.businessLead.id) : "/panel"}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          {project.businessLead?.businessName
            ? `Volver al lead: ${project.businessLead.businessName}`
            : "Volver al panel"}
        </Link>
      </div>

      <header className="mb-8">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
            {isEditing ? name || "Proyecto" : project.name}
          </h1>
          {!isEditing && project.status && (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
            >
              {project.status}
            </span>
          )}
          {isEditing && (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                PROJECT_STATUS_CLASSES[status] ?? "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]"
              }`}
            >
              {status || "—"}
            </span>
          )}
        </div>
        {(project.serviceType || project.startDate || (isEditing && (serviceType || startDate))) && (
          <p className="mt-2 text-[#616161] dark:text-[#b0b0b0] text-sm">
            {[
              isEditing ? serviceType : project.serviceType,
              (isEditing ? startDate : project.startDate)
                ? formatDateShort(isEditing ? (startDate ? `${startDate}T12:00:00` : "") : project.startDate ?? "", false)
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Información general">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="project-edit-name" className={labelClassName}>
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="project-edit-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClassName}
                  placeholder="Nombre del proyecto"
                />
              </div>
              <div>
                <label htmlFor="project-edit-serviceType" className={labelClassName}>
                  Tipo de servicio
                </label>
                <input
                  id="project-edit-serviceType"
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className={inputClassName}
                  placeholder="Ej. Desarrollo web, Remodelación"
                />
              </div>
              <div>
                <label htmlFor="project-edit-status" className={labelClassName}>
                  Estado
                </label>
                <select
                  id="project-edit-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClassName}
                >
                  {PROJECT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="project-edit-description" className={labelClassName}>
                  Descripción
                </label>
                <textarea
                  id="project-edit-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClassName}
                  placeholder="Descripción o alcance"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="project-edit-startDate" className={labelClassName}>
                    Fecha de inicio
                  </label>
                  <input
                    id="project-edit-startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="project-edit-estimatedEndDate" className={labelClassName}>
                    Fecha estimada de fin
                  </label>
                  <input
                    id="project-edit-estimatedEndDate"
                    type="date"
                    value={estimatedEndDate}
                    onChange={(e) => setEstimatedEndDate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <dl className="space-y-0">
                <Field label="Nombre" value={project.name} />
                <Field label="Tipo de servicio" value={project.serviceType} />
                <Field label="Estado" value={project.status} />
                <Field label="Descripción" value={project.description} />
                <Field
                  label="Inicio"
                  value={project.startDate ? formatDateShort(project.startDate, false) : null}
                />
                <Field
                  label="Fin estimado"
                  value={
                    project.estimatedEndDate
                      ? formatDateShort(project.estimatedEndDate, false)
                      : null
                  }
                />
                <Field
                  label="Responsable"
                  value={project.responsible?.name ?? null}
                />
              </dl>
              <button
                type="button"
                onClick={handleStartEdit}
                className="mt-3 px-4 py-2 rounded-lg border border-orange-500 text-orange-500 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-950/30"
              >
                Editar
              </button>
            </>
          )}
        </SectionCard>

        {project.businessLead && (
          <SectionCard title="Cliente / Lead">
            <dl className="space-y-0">
              <Field label="Negocio" value={project.businessLead.businessName} />
              <Field
                label="Categoría"
                value={getCategoryLabel(project.businessLead.category)}
              />
              <Field label="Ciudad" value={project.businessLead.city} />
              <Field label="País" value={project.businessLead.country} />
            </dl>
            {project.businessLead.id && (
              <Link
                href={Routes.panelLead(project.businessLead.id)}
                className="inline-flex items-center gap-1.5 mt-3 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm"
              >
                Ver ficha del lead →
              </Link>
            )}
          </SectionCard>
        )}

        {project.proposal && (
          <SectionCard title="Propuesta origen">
            <dl className="space-y-0">
              <Field label="Monto" value={formatCurrency(project.proposal.amount)} />
              <Field label="Estado" value={project.proposal.status} />
              <Field label="Producto" value={project.proposal.product} />
              <Field
                label="Fecha envío"
                value={
                  project.proposal.sentDate
                    ? formatDateShort(project.proposal.sentDate, false)
                    : null
                }
              />
              <Field label="Vendedor" value={project.proposal.assignedSeller?.name} />
              {project.proposal.fileOrUrl && (
                <Field label="Archivo / enlace">
                  <a
                    href={project.proposal.fileOrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm break-all"
                  >
                    {project.proposal.fileOrUrl}
                  </a>
                </Field>
              )}
              {project.proposal.notes && (
                <Field label="Notas" value={project.proposal.notes} />
              )}
            </dl>
          </SectionCard>
        )}
      </div>

      <div className="mt-6 text-xs text-[#9e9e9e] dark:text-[#666]">
        Creado: {project.createdAt ? formatDateShort(project.createdAt, true) : "—"}
        {project.updatedAt && (
          <> · Actualizado: {formatDateShort(project.updatedAt, true)}</>
        )}
      </div>
    </main>
  );
}
