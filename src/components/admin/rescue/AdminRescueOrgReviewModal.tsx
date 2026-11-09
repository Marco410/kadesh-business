"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import {
  AdminButton,
  AdminDefinitionList,
  AdminErrorState,
  AdminLoadingRows,
  AdminModal,
  AdminSectionCard,
  AdminStatusBadge,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminTextareaClass,
  formatPersonName,
} from "../ui";
import {
  RESCUE_ORG_STATUS,
  RESCUE_ORG_STATUS_LABELS,
  RESCUE_ORG_STATUS_TONE,
  RESCUE_ORG_TYPE_LABELS,
  RESCUE_ROLE_LABELS,
  RESCUE_SPECIES_LABELS,
  RESCUE_STATUS_NOTE_MAX,
  RESCUE_STATUS_NOTE_MIN,
  rescueOrgPublicUrl,
  rescueWhatsAppUrl,
  type RescueOrgStatus,
} from "./constants";
import {
  ADMIN_RESCUE_ORG_QUERY,
  ADMIN_UPDATE_RESCUE_ORG_MUTATION,
  type AdminRescueOrgDetail,
  type AdminRescueOrgResponse,
} from "./queries";
import { adminErrorText } from "../errors";

const REFETCH = ["AdminRescueOrg", "AdminRescueOrgs", "AdminRescueNavCount"];

const STATUS_SUCCESS: Record<RescueOrgStatus, string> = {
  pending: "Volvió a «En revisión»",
  verified: "Espacio verificado: ya tiene perfil público y le avisamos a su equipo",
  rejected: "Espacio rechazado: le avisamos con el motivo",
  suspended: "Espacio suspendido: dejó de verse en público",
};

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-orange-600 hover:underline dark:text-orange-400">
      {children}
    </a>
  );
}

function count(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("es-MX");
}

function profileItems(org: AdminRescueOrgDetail) {
  // Solo los tipos vigentes: hay espacios con valores viejos (p. ej. «other») que ya no existen.
  const species = (org.species ?? [])
    .map((value) => RESCUE_SPECIES_LABELS[value])
    .filter(Boolean)
    .join(", ");
  return [
    { label: "Tipo", value: RESCUE_ORG_TYPE_LABELS[org.type ?? ""] ?? org.type ?? "—" },
    { label: "Zona", value: [org.city, org.state].filter(Boolean).join(", ") || "—" },
    { label: "Rescata", value: species || "Todo tipo de animales" },
    ...(org.capacity ? [{ label: "Capacidad", value: `${count(org.capacity)} animales` }] : []),
    ...(org.description ? [{ label: "Sobre ellos", value: <span className="whitespace-pre-line">{org.description}</span> }] : []),
    ...(org.needs ? [{ label: "Lo que necesitan", value: <span className="whitespace-pre-line">{org.needs}</span> }] : []),
    ...(org.donationUrl ? [{ label: "Donar", value: <ExternalLink href={org.donationUrl}>{org.donationUrl}</ExternalLink> }] : []),
    ...(org.donationInfo ? [{ label: "Datos para donar", value: <span className="whitespace-pre-line">{org.donationInfo}</span> }] : []),
  ];
}

function contactItems(org: AdminRescueOrgDetail) {
  const creator = org.createdBy;
  const verifyText = `Hola, somos KADESH. Estamos revisando el espacio de rescate «${org.name}» para verificarlo.`;
  return [
    ...(org.whatsapp
      ? [{ label: "WhatsApp", value: <ExternalLink href={rescueWhatsAppUrl(org.whatsapp, verifyText)}>{org.whatsapp}</ExternalLink> }]
      : []),
    ...(org.email ? [{ label: "Correo", value: <ExternalLink href={`mailto:${org.email}`}>{org.email}</ExternalLink> }] : []),
    ...(org.websiteUrl ? [{ label: "Sitio", value: <ExternalLink href={org.websiteUrl}>{org.websiteUrl}</ExternalLink> }] : []),
    ...(org.facebookUrl ? [{ label: "Facebook", value: <ExternalLink href={org.facebookUrl}>{org.facebookUrl}</ExternalLink> }] : []),
    ...(org.instagramUrl ? [{ label: "Instagram", value: <ExternalLink href={org.instagramUrl}>{org.instagramUrl}</ExternalLink> }] : []),
    ...(org.tiktokUrl ? [{ label: "TikTok", value: <ExternalLink href={org.tiktokUrl}>{org.tiktokUrl}</ExternalLink> }] : []),
    {
      label: "Lo activó",
      value: creator
        ? [formatPersonName(creator.name, creator.lastName), creator.email, creator.phone].filter(Boolean).join(" · ")
        : "—",
    },
    { label: "Activado", value: org.createdAt ? formatDateShort(org.createdAt) : "—" },
  ];
}

/**
 * Revisar un espacio de rescate: perfil, contacto (WhatsApp con mensaje listo para validarlos),
 * equipo y cifras. Acciones: Verificar, Rechazar o Suspender (con mensaje que el espacio ve en su
 * panel), Volver a «En revisión», marcar aliado (solo verificados) con su orden en el muro, y
 * notas internas que solo ven los admins.
 */
export default function AdminRescueOrgReviewModal({
  orgId,
  onClose,
  onChanged,
}: {
  orgId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [statusNote, setStatusNote] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [allyOrder, setAllyOrder] = useState("");
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const { data, loading, error } = useQuery<AdminRescueOrgResponse>(ADMIN_RESCUE_ORG_QUERY, {
    variables: { id: orgId ?? "" },
    skip: !orgId,
    fetchPolicy: "cache-and-network",
  });
  const [update, { loading: saving }] = useMutation(ADMIN_UPDATE_RESCUE_ORG_MUTATION, { refetchQueries: REFETCH });
  const org = data?.rescueOrganization ?? null;

  useApplyOnKeyChange(orgId ?? "", () => setInitializedFor(null));
  // Los borradores se llenan una vez por espacio, cuando llegan sus datos.
  if (org && initializedFor !== org.id) {
    setInitializedFor(org.id);
    setStatusNote(org.statusNote ?? "");
    setAdminNotes(org.adminNotes ?? "");
    setAllyOrder(org.allyOrder != null ? String(org.allyOrder) : "");
  }

  const save = async (fields: Record<string, unknown>, success: string) => {
    if (!org) return;
    try {
      await update({ variables: { id: org.id, data: fields } });
      sileo.success({ title: success });
      onChanged();
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar",
        description: adminErrorText(err, "Intenta de nuevo."),
      });
    }
  };

  const changeStatus = (status: RescueOrgStatus) => {
    const note = statusNote.trim();
    const needsReason = status === RESCUE_ORG_STATUS.REJECTED || status === RESCUE_ORG_STATUS.SUSPENDED;
    if (needsReason && note.length < RESCUE_STATUS_NOTE_MIN) {
      sileo.error({
        title: "Escribe el motivo",
        description: "El espacio lo ve en su panel. Explícale qué falta o qué pasó.",
      });
      return;
    }
    void save({ status, statusNote: note }, STATUS_SUCCESS[status]);
  };

  const status = org?.status ?? "";
  const verified = status === RESCUE_ORG_STATUS.VERIFIED;
  const publicUrl = verified && org?.slug ? rescueOrgPublicUrl(org.slug) : null;

  return (
    <AdminModal
      open={Boolean(orgId)}
      onClose={onClose}
      ariaLabel="Revisar espacio de rescate"
      size="lg"
      title={org?.name ?? "Espacio de rescate"}
      subtitle={org ? [RESCUE_ORG_TYPE_LABELS[org.type ?? ""], [org.city, org.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ") : undefined}
      headerAside={
        org ? (
          <span className="flex flex-wrap gap-1.5">
            <AdminStatusBadge label={RESCUE_ORG_STATUS_LABELS[status] ?? "Sin estado"} tone={RESCUE_ORG_STATUS_TONE[status] ?? "neutral"} />
            {org.isAlly ? <AdminStatusBadge label="Aliado" tone="accent" /> : null}
          </span>
        ) : null
      }
      footer={
        <>
          {publicUrl ? (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={adminButtonClass({ variant: "outline" })}>
              Ver perfil público
            </a>
          ) : null}
          <AdminButton variant="ghost" onClick={onClose}>
            Cerrar
          </AdminButton>
        </>
      }
    >
      {error ? (
        <AdminErrorState message="No se pudo cargar el espacio." />
      ) : !org ? (
        loading ? <AdminLoadingRows rows={5} /> : <AdminErrorState message="No encontramos este espacio." />
      ) : (
        <div className="flex flex-col gap-4">
          {status === RESCUE_ORG_STATUS.PENDING ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              Antes de verificar, confirma que sea real: escríbeles por WhatsApp y revisa sus redes. Al verificarlo, su perfil
              aparece en /organizaciones, sus animales muestran «Publicado por» y le avisamos a su equipo.
            </p>
          ) : null}

          <AdminSectionCard title="Decisión" description="El mensaje lo ve el equipo del espacio en su panel.">
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="rescue-status-note" className={adminLabelClass}>
                  Mensaje para el espacio {status === RESCUE_ORG_STATUS.PENDING ? "(obligatorio para rechazar)" : ""}
                </label>
                <textarea
                  id="rescue-status-note"
                  value={statusNote}
                  maxLength={RESCUE_STATUS_NOTE_MAX}
                  onChange={(event) => setStatusNote(event.target.value)}
                  className={adminTextareaClass}
                  placeholder="Ej.: Nos falta ver sus redes o fotos de los rescates. Escríbenos por WhatsApp y lo revisamos."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {status !== RESCUE_ORG_STATUS.VERIFIED ? (
                  <AdminButton variant="dark" size="sm" disabled={saving} onClick={() => changeStatus(RESCUE_ORG_STATUS.VERIFIED)}>
                    Verificar
                  </AdminButton>
                ) : null}
                {status === RESCUE_ORG_STATUS.PENDING ? (
                  <AdminButton variant="danger" size="sm" disabled={saving} onClick={() => changeStatus(RESCUE_ORG_STATUS.REJECTED)}>
                    Rechazar
                  </AdminButton>
                ) : null}
                {status === RESCUE_ORG_STATUS.VERIFIED ? (
                  <AdminButton variant="danger" size="sm" disabled={saving} onClick={() => changeStatus(RESCUE_ORG_STATUS.SUSPENDED)}>
                    Suspender
                  </AdminButton>
                ) : null}
                {status === RESCUE_ORG_STATUS.REJECTED || status === RESCUE_ORG_STATUS.SUSPENDED ? (
                  <AdminButton variant="outline" size="sm" disabled={saving} onClick={() => changeStatus(RESCUE_ORG_STATUS.PENDING)}>
                    Volver a «En revisión»
                  </AdminButton>
                ) : null}
                {statusNote.trim() !== (org.statusNote ?? "").trim() && status !== RESCUE_ORG_STATUS.PENDING ? (
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => void save({ statusNote: statusNote.trim() }, "Mensaje guardado")}
                  >
                    Guardar solo el mensaje
                  </AdminButton>
                ) : null}
              </div>
              {org.verifiedAt ? (
                <p className="text-xs text-dash-muted">Verificado el {formatDateShort(org.verifiedAt)}.</p>
              ) : null}
            </div>
          </AdminSectionCard>

          {verified ? (
            <AdminSectionCard
              title="Aliado KADESH"
              description="Los aliados salen en el muro de la portada y en /aliados. Solo un espacio verificado puede serlo."
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="sm:w-48">
                  <label htmlFor="rescue-ally-order" className={adminLabelClass}>
                    Orden en el muro (opcional)
                  </label>
                  <input
                    id="rescue-ally-order"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={allyOrder}
                    onChange={(event) => setAllyOrder(event.target.value)}
                    className={adminInputClass}
                    placeholder="Sin orden"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    variant={org.isAlly ? "outline" : "dark"}
                    size="sm"
                    disabled={saving}
                    onClick={() =>
                      void save(
                        { isAlly: !org.isAlly, allyOrder: allyOrder.trim() ? Number(allyOrder) : null },
                        org.isAlly ? "Ya no es aliado" : "Ahora es Aliado KADESH",
                      )
                    }
                  >
                    {org.isAlly ? "Quitar de aliados" : "Marcar como aliado"}
                  </AdminButton>
                  {org.isAlly && allyOrder.trim() !== (org.allyOrder != null ? String(org.allyOrder) : "") ? (
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={() => void save({ allyOrder: allyOrder.trim() ? Number(allyOrder) : null }, "Orden guardado")}
                    >
                      Guardar orden
                    </AdminButton>
                  ) : null}
                </div>
              </div>
              {org.isAlly && org.allySince ? (
                <p className="mt-2 text-xs text-dash-muted">Aliado desde el {formatDateShort(org.allySince, false)}.</p>
              ) : null}
            </AdminSectionCard>
          ) : null}

          <AdminSectionCard title="Perfil">
            <AdminDefinitionList items={profileItems(org)} columns={2} />
          </AdminSectionCard>

          <AdminSectionCard title="Contacto">
            <AdminDefinitionList items={contactItems(org)} columns={2} />
          </AdminSectionCard>

          <AdminSectionCard title="Cifras y equipo">
            <AdminDefinitionList
              columns={2}
              items={[
                { label: "Animales publicados", value: count(org.publishedCount) },
                { label: "En adopción", value: count(org.inAdoptionCount) },
                { label: "Adoptados", value: count(org.adoptedCount) },
                { label: "Fichas internas", value: count(org.petsCount) },
              ]}
            />
            <ul className="mt-3 divide-y divide-dash-line">
              {org.members.map((member) => (
                <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold text-dash-ink">{member.userName || "Sin nombre"}</span>
                    {member.userEmail ? <span className="ml-2 text-dash-muted">{member.userEmail}</span> : null}
                  </span>
                  <AdminStatusBadge label={RESCUE_ROLE_LABELS[member.role] ?? member.role} />
                </li>
              ))}
            </ul>
          </AdminSectionCard>

          <AdminSectionCard title="Notas internas" description="Solo las ven los admins de KADESH.">
            <textarea
              aria-label="Notas internas"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              className={adminTextareaClass}
              placeholder="Cómo se validó, con quién hablamos, pendientes…"
            />
            {adminNotes.trim() !== (org.adminNotes ?? "").trim() ? (
              <div className="mt-2">
                <AdminButton variant="outline" size="sm" disabled={saving} onClick={() => void save({ adminNotes: adminNotes.trim() }, "Notas guardadas")}>
                  Guardar notas
                </AdminButton>
              </div>
            ) : null}
          </AdminSectionCard>
        </div>
      )}
    </AdminModal>
  );
}
