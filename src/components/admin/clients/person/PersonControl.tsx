"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { beginImpersonation } from "kadesh/components/impersonation";
import { formatDateShort } from "kadesh/utils/format-date";
import { AdminErrorState, AdminLoadingRows, formatPersonName } from "../../ui";
import {
  ADMIN_ANONYMIZE_USER_MUTATION,
  ADMIN_EXPORT_PERSON_DATA_MUTATION,
  ADMIN_PERSON_CONTROL_QUERY,
  ADMIN_REVOKE_SESSIONS_MUTATION,
  ADMIN_SET_USER_SUSPENSION_MUTATION,
  ADMIN_START_IMPERSONATION_MUTATION,
  type AdminImpersonationResult,
  type AdminOpsActionResult,
  type AdminPersonControlResponse,
} from "../ops-queries";

const MIN_REASON = 5;
const fieldClass =
  "w-full rounded-xl border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#212121] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white";
const buttonClass =
  "h-11 rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

function Block({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border p-4 ${
        danger ? "border-red-300 dark:border-red-500/40" : "border-[#e0e0e0] dark:border-[#3a3a3a]"
      }`}
    >
      <h4 className={`text-sm font-semibold ${danger ? "text-red-700 dark:text-red-400" : "text-[#212121] dark:text-white"}`}>
        {title}
      </h4>
      <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function slug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function download(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Acceso de una persona: ver el panel como ella (solo lectura), suspender, cerrar sesiones y
 * derechos ARCO (exportar y anonimizar). Nada de esto aplica al equipo de Kadesh.
 */
export default function PersonControl({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useQuery<AdminPersonControlResponse>(
    ADMIN_PERSON_CONTROL_QUERY,
    { variables: { id: userId }, fetchPolicy: "network-only" },
  );
  const [viewReason, setViewReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [anonymizeReason, setAnonymizeReason] = useState("");

  const [startImpersonation, { loading: starting }] = useMutation<{
    adminStartImpersonation: AdminImpersonationResult;
  }>(ADMIN_START_IMPERSONATION_MUTATION);
  const [setSuspension, { loading: suspending }] = useMutation<{
    adminSetUserSuspension: AdminOpsActionResult;
  }>(ADMIN_SET_USER_SUSPENSION_MUTATION);
  const [revoke, { loading: revoking }] = useMutation<{ adminRevokeSessions: AdminOpsActionResult }>(
    ADMIN_REVOKE_SESSIONS_MUTATION,
  );
  const [exportData, { loading: exporting }] = useMutation<{ adminExportPersonData: unknown }>(
    ADMIN_EXPORT_PERSON_DATA_MUTATION,
  );
  const [anonymize, { loading: anonymizing }] = useMutation<{ adminAnonymizeUser: AdminOpsActionResult }>(
    ADMIN_ANONYMIZE_USER_MUTATION,
  );

  if (error) return <AdminErrorState message={error.message} />;
  const person = data?.user;
  if (loading && !person) return <AdminLoadingRows rows={4} />;
  if (!person) return <AdminErrorState message="No se encontró a la persona." />;

  const name = formatPersonName(person.name, person.lastName);
  const isKadesh = person.roles.some((role) => role.name === "admin");

  const report = async (outcome: AdminOpsActionResult | undefined, fallback: string) => {
    if (!outcome?.success) {
      sileo.error({ title: outcome?.message ?? fallback });
      return false;
    }
    sileo.success({ title: outcome.message });
    await refetch();
    return true;
  };

  const viewAs = async () => {
    try {
      const { data: result } = await startImpersonation({
        variables: { userId, reason: viewReason.trim() },
      });
      const outcome = result?.adminStartImpersonation;
      if (!outcome?.success || !outcome.token || !outcome.expiresAt) {
        sileo.error({ title: outcome?.message ?? "No se pudo entrar como esta persona" });
        return;
      }
      beginImpersonation(outcome.token, {
        userName: name,
        companyName: outcome.companyName,
        expiresAt: outcome.expiresAt,
        returnUrl: window.location.href,
      });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo entrar como esta persona" });
    }
  };

  const toggleSuspension = async () => {
    try {
      const suspended = !person.suspendedAt;
      const { data: result } = await setSuspension({
        variables: { userId, suspended, reason: suspendReason.trim() || null },
      });
      if (await report(result?.adminSetUserSuspension, "No se pudo cambiar el acceso")) setSuspendReason("");
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo cambiar el acceso" });
    }
  };

  const revokeSessions = async () => {
    if (!window.confirm(`¿Cerrar todas las sesiones de ${name}? Tendrá que volver a iniciar sesión.`)) return;
    try {
      const { data: result } = await revoke({ variables: { userId } });
      await report(result?.adminRevokeSessions, "No se pudieron cerrar las sesiones");
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudieron cerrar las sesiones" });
    }
  };

  const exportPersonData = async () => {
    try {
      const { data: result } = await exportData({ variables: { userId } });
      if (!result?.adminExportPersonData) throw new Error("Sin datos");
      download(`datos-personales-${slug(name) || "persona"}-${new Date().toISOString().slice(0, 10)}.json`, result.adminExportPersonData);
      sileo.success({ title: "Archivo descargado" });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudieron exportar los datos" });
    }
  };

  const anonymizeAccount = async () => {
    if (!window.confirm(`¿Anonimizar la cuenta de ${name}? Se borran sus datos personales y no se puede deshacer.`)) return;
    try {
      const { data: result } = await anonymize({
        variables: { userId, confirmEmail: confirmEmail.trim(), reason: anonymizeReason.trim() },
      });
      if (await report(result?.adminAnonymizeUser, "No se pudo anonimizar la cuenta")) {
        setConfirmEmail("");
        setAnonymizeReason("");
      }
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo anonimizar la cuenta" });
    }
  };

  if (person.anonymizedAt) {
    return (
      <p className="rounded-xl bg-black/5 px-4 py-3 text-sm text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]">
        Cuenta anonimizada el {formatDateShort(person.anonymizedAt, false)}: sus datos personales se
        borraron y ya no puede entrar.
      </p>
    );
  }

  if (isKadesh) {
    return (
      <p className="rounded-xl bg-black/5 px-4 py-3 text-sm text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]">
        {name} es del equipo de Kadesh: no se puede suspender, ver como ni anonimizar desde aquí.
      </p>
    );
  }

  const companySuspended = Boolean(person.company?.suspendedAt);

  return (
    <div className="flex flex-col gap-4">
      {person.suspendedAt || companySuspended ? (
        <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          <p className="font-semibold">
            {person.suspendedAt
              ? `Acceso suspendido desde el ${formatDateShort(person.suspendedAt, false)}`
              : `Su empresa (${person.company?.name}) está suspendida`}
          </p>
          {person.suspendedReason ? <p className="mt-0.5">{person.suspendedReason}</p> : null}
        </div>
      ) : null}

      <Block
        title="Ver el panel como esta persona"
        description="Ves exactamente lo que ve, sin poder cambiar nada, durante una hora. Queda registrado con el motivo."
      >
        <div className="flex flex-col gap-2">
          <input
            value={viewReason}
            onChange={(e) => setViewReason(e.target.value)}
            maxLength={500}
            placeholder="Motivo: p. ej. dice que no ve sus leads de ayer"
            className={`${fieldClass} h-11`}
            aria-label="Motivo para ver el panel como esta persona"
          />
          <button
            type="button"
            onClick={viewAs}
            disabled={starting || viewReason.trim().length < MIN_REASON || Boolean(person.suspendedAt) || companySuspended}
            className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600 sm:self-start`}
          >
            Ver como {person.name || "esta persona"}
          </button>
        </div>
      </Block>

      <Block
        title={person.suspendedAt ? "Reactivar acceso" : "Suspender acceso"}
        description={
          person.suspendedAt
            ? "Podrá volver a iniciar sesión."
            : "No podrá entrar y se cierran sus sesiones abiertas. Sus datos no se borran."
        }
      >
        <div className="flex flex-col gap-2">
          {!person.suspendedAt ? (
            <input
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              maxLength={500}
              placeholder={`Motivo interno (mínimo ${MIN_REASON} letras)`}
              className={`${fieldClass} h-11`}
              aria-label="Motivo de la suspensión"
            />
          ) : null}
          <button
            type="button"
            onClick={toggleSuspension}
            disabled={suspending || (!person.suspendedAt && suspendReason.trim().length < MIN_REASON)}
            className={`${buttonClass} sm:self-start ${
              person.suspendedAt
                ? "border border-[#e0e0e0] text-[#212121] dark:border-[#3a3a3a] dark:text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {person.suspendedAt ? "Reactivar acceso" : "Suspender acceso"}
          </button>
        </div>
      </Block>

      <Block
        title="Cerrar sus sesiones"
        description="Tendrá que volver a iniciar sesión en todos sus dispositivos (útil si compartió su cuenta o perdió un equipo)."
      >
        <button
          type="button"
          onClick={revokeSessions}
          disabled={revoking}
          className={`${buttonClass} border border-[#e0e0e0] text-[#212121] dark:border-[#3a3a3a] dark:text-white`}
        >
          Cerrar sesiones
        </button>
      </Block>

      <Block
        title="Exportar sus datos (ARCO)"
        description="Descarga un archivo con todo lo que Kadesh guarda de esta persona, para entregárselo si lo pide. Los datos bancarios salen enmascarados."
      >
        <button
          type="button"
          onClick={exportPersonData}
          disabled={exporting}
          className={`${buttonClass} border border-[#e0e0e0] text-[#212121] dark:border-[#3a3a3a] dark:text-white`}
        >
          {exporting ? "Preparando…" : "Descargar sus datos"}
        </button>
      </Block>

      <Block
        danger
        title="Anonimizar la cuenta (ARCO)"
        description="Borra su nombre, correo, teléfono, foto y datos bancarios, y la deja sin acceso. Lo que hizo en el CRM de su empresa se conserva como «Usuario eliminado». No se puede deshacer."
      >
        <div className="flex flex-col gap-2">
          <input
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={`Escribe su correo para confirmar: ${person.email ?? ""}`}
            className={`${fieldClass} h-11`}
            aria-label="Correo de la cuenta para confirmar"
            autoComplete="off"
          />
          <input
            value={anonymizeReason}
            onChange={(e) => setAnonymizeReason(e.target.value)}
            maxLength={500}
            placeholder="Motivo (sin datos personales): p. ej. lo pidió por correo el 11 oct"
            className={`${fieldClass} h-11`}
            aria-label="Motivo de la anonimización"
          />
          <button
            type="button"
            onClick={anonymizeAccount}
            disabled={
              anonymizing ||
              anonymizeReason.trim().length < MIN_REASON ||
              confirmEmail.trim().toLowerCase() !== (person.email ?? "").trim().toLowerCase()
            }
            className={`${buttonClass} bg-red-600 text-white hover:bg-red-700 sm:self-start`}
          >
            Anonimizar cuenta
          </button>
        </div>
      </Block>
    </div>
  );
}
