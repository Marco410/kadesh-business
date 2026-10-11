"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import { ROLE_LABELS } from "../../../constants";
import { AdminDrawer, formatPersonName } from "../../../ui";
import type { AdminCompanyProfile } from "../../clients-queries";
import {
  ADMIN_REVOKE_SESSIONS_MUTATION,
  ADMIN_SET_COMPANY_SUSPENSION_MUTATION,
  ADMIN_TRANSFER_OWNERSHIP_MUTATION,
  type AdminOpsActionResult,
} from "../../ops-queries";

type Mode = "suspend" | "reactivate" | "revoke" | "transfer" | null;

const MIN_REASON = 5;

const secondaryButton =
  "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer";
const fieldClass =
  "w-full rounded-xl border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#212121] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white";

/**
 * Acceso de la empresa: suspender o reactivar (nadie del equipo entra), cerrar las sesiones
 * del equipo y transferir la propiedad. Todo pide confirmación y queda en Actividad.
 */
export default function CompanyControl({
  company,
  onChanged,
}: {
  company: AdminCompanyProfile;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<Mode>(null);
  const [reason, setReason] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [removeOtherAdmins, setRemoveOtherAdmins] = useState(false);
  const [setSuspension, { loading: suspending }] = useMutation<{
    adminSetCompanySuspension: AdminOpsActionResult;
  }>(ADMIN_SET_COMPANY_SUSPENSION_MUTATION);
  const [revoke, { loading: revoking }] = useMutation<{ adminRevokeSessions: AdminOpsActionResult }>(
    ADMIN_REVOKE_SESSIONS_MUTATION,
  );
  const [transfer, { loading: transferring }] = useMutation<{
    adminTransferCompanyOwnership: AdminOpsActionResult;
  }>(ADMIN_TRANSFER_OWNERSHIP_MUTATION);

  const suspended = Boolean(company.suspendedAt);
  const busy = suspending || revoking || transferring;
  const owners = company.users.filter((user) => !user.suspendedAt);

  const close = () => {
    setMode(null);
    setReason("");
    setNewOwnerId("");
    setRemoveOtherAdmins(false);
  };

  const finish = (outcome: AdminOpsActionResult | undefined, fallback: string) => {
    if (!outcome?.success) {
      sileo.error({ title: outcome?.message ?? fallback });
      return;
    }
    sileo.success({ title: outcome.message });
    close();
    onChanged();
  };

  const run = async () => {
    try {
      if (mode === "suspend" || mode === "reactivate") {
        const { data } = await setSuspension({
          variables: { companyId: company.id, suspended: mode === "suspend", reason: reason.trim() || null },
        });
        finish(data?.adminSetCompanySuspension, "No se pudo cambiar el acceso");
      } else if (mode === "revoke") {
        const { data } = await revoke({ variables: { companyId: company.id } });
        finish(data?.adminRevokeSessions, "No se pudieron cerrar las sesiones");
      } else if (mode === "transfer") {
        const { data } = await transfer({
          variables: { companyId: company.id, newOwnerId, removeOtherAdmins },
        });
        finish(data?.adminTransferCompanyOwnership, "No se pudo transferir la propiedad");
      }
    } catch (error) {
      sileo.error({ title: error instanceof Error ? error.message : "No se pudo completar" });
    }
  };

  const canConfirm =
    mode === "suspend"
      ? reason.trim().length >= MIN_REASON
      : mode === "transfer"
        ? Boolean(newOwnerId)
        : true;

  const titles: Record<Exclude<Mode, null>, string> = {
    suspend: "Suspender acceso",
    reactivate: "Reactivar acceso",
    revoke: "Cerrar sesiones del equipo",
    transfer: "Transferir propiedad",
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">Acceso de la cuenta</p>
      {suspended ? (
        <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-800 dark:text-red-300">
          <p className="font-semibold">
            Suspendida desde el {formatDateShort(company.suspendedAt, false)}
          </p>
          {company.suspendedReason ? <p className="mt-0.5">{company.suspendedReason}</p> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={() => setMode(suspended ? "reactivate" : "suspend")}
          className={suspended ? secondaryButton : `${secondaryButton} text-red-700 dark:text-red-400`}
        >
          {suspended ? "Reactivar acceso" : "Suspender acceso"}
        </button>
        <button type="button" onClick={() => setMode("revoke")} className={secondaryButton}>
          Cerrar sesiones del equipo
        </button>
        <button type="button" onClick={() => setMode("transfer")} className={secondaryButton}>
          Transferir propiedad
        </button>
      </div>

      <AdminDrawer
        open={mode !== null}
        onClose={close}
        ariaLabel={mode ? titles[mode] : "Acceso de la cuenta"}
        title={mode ? titles[mode] : ""}
        subtitle={company.name}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canConfirm && !busy) void run();
          }}
          className="flex flex-col gap-4"
        >
          {mode === "suspend" ? (
            <>
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Nadie del equipo podrá entrar y se cierran las sesiones abiertas. Al iniciar sesión
                verán un aviso para escribir a Kadesh. Sus datos no se borran y el cobro en Stripe
                sigue igual: si hay que cancelarlo, hazlo aparte.
              </p>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                  Motivo (interno, mínimo {MIN_REASON} letras)
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className={fieldClass}
                  placeholder="Ej.: Pago rechazado tres veces y sin respuesta."
                />
              </label>
            </>
          ) : null}
          {mode === "reactivate" ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              El equipo podrá volver a iniciar sesión. Tendrán que entrar de nuevo: sus sesiones
              anteriores se cerraron al suspender.
            </p>
          ) : null}
          {mode === "revoke" ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Todas las personas de {company.name} tendrán que volver a iniciar sesión en todos
              sus dispositivos. Úsalo si sospechas que alguien compartió su cuenta o perdió un
              equipo.
            </p>
          ) : null}
          {mode === "transfer" ? (
            <>
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                La persona elegida queda como administradora de la empresa. La facturación no
                cambia: la tarjeta y el cliente de Stripe siguen siendo de quien pagó.
              </p>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">Nuevo dueño</span>
                <select
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                  className={`${fieldClass} h-11 cursor-pointer`}
                >
                  <option value="">Elige a alguien del equipo</option>
                  {owners.map((user) => (
                    <option key={user.id} value={user.id}>
                      {formatPersonName(user.name, user.lastName)} ·{" "}
                      {user.roles.map((role) => ROLE_LABELS[role.name] ?? role.name).join(", ") || "sin rol"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex min-h-11 items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeOtherAdmins}
                  onChange={(e) => setRemoveOtherAdmins(e.target.checked)}
                  className="h-4 w-4 accent-orange-500"
                />
                Quitar el rol de administrador a los demás
              </label>
            </>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              className="h-11 rounded-xl border border-[#e0e0e0] px-5 text-sm font-semibold text-[#212121] dark:border-[#3a3a3a] dark:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canConfirm || busy}
              className={`h-11 rounded-xl px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                mode === "suspend" ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {mode ? titles[mode] : "Confirmar"}
            </button>
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
