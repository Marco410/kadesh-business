"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import { TRACK_EVENT, trackActivity } from "kadesh/utils/activity";
import { ROLE_LABELS } from "../../constants";
import { useAdminNavigation } from "../../hooks/useAdminNavigation";
import {
  AdminAvatar,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "../../ui";
import {
  ADMIN_PERSON_HEADER_QUERY,
  type AdminPersonHeaderResponse,
} from "../clients-queries";
import PersonPanels from "./PersonPanels";

/**
 * Ficha de una persona sin empresa (cuentas Pet o que aún no crean negocio).
 * Si tiene empresa, la entrada correcta es el 360 de su empresa.
 */
export default function AdminPerson360({ userId }: { userId: string }) {
  const { setParams, openPerson } = useAdminNavigation();
  const { data, loading, error } = useQuery<AdminPersonHeaderResponse>(
    ADMIN_PERSON_HEADER_QUERY,
    { variables: { id: userId }, fetchPolicy: "cache-and-network" },
  );
  const person = data?.user;

  useEffect(() => {
    trackActivity(TRACK_EVENT.ADMIN_VIEWED_PERSON, { entityType: "User", entityId: userId });
  }, [userId]);

  const back = () =>
    setParams({ usuario: null, empresa: null, persona: null, detalle: null, sub: null }, "push");

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={back}
        className="inline-flex min-h-10 items-center gap-1.5 self-start text-sm text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0] cursor-pointer"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Clientes
      </button>

      {error ? (
        <AdminErrorState message="No se pudo cargar a la persona." />
      ) : loading && !person ? (
        <AdminLoadingRows rows={3} />
      ) : !person ? (
        <AdminEmptyState
          title="No se encontró a la persona"
          description="Puede que la hayan borrado o el enlace esté mal."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <aside className={`${surfaceClass} p-4 sm:p-5 lg:sticky lg:top-24`}>
            <div className="flex items-start gap-3">
              <AdminAvatar name={person.name} lastName={person.lastName} size={44} />
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#212121] dark:text-white">
                  {formatPersonName(person.name, person.lastName, person.secondLastName)}
                </h2>
                <p className="break-all text-sm text-[#616161] dark:text-[#b0b0b0]">
                  {person.email ?? "Sin correo"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {person.roles.map((r) => (
                <AdminStatusBadge
                  key={r.name}
                  label={ROLE_LABELS[r.name] ?? r.name}
                  className="bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
                />
              ))}
              {person.verified ? (
                <AdminStatusBadge
                  label="Verificada"
                  className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                />
              ) : null}
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-[#9e9e9e]">Empresa</dt>
                <dd className="text-[#212121] dark:text-white">
                  {person.company ? (
                    <button
                      type="button"
                      onClick={() => openPerson(person.id, person.company?.id)}
                      className="font-medium text-orange-600 hover:underline dark:text-orange-400 cursor-pointer"
                    >
                      {person.company.name}
                    </button>
                  ) : (
                    "Sin empresa"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9e9e9e]">Alta</dt>
                <dd className="text-[#212121] dark:text-white">
                  {formatDateShort(person.createdAt, false)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9e9e9e]">Último acceso</dt>
                <dd className="text-[#212121] dark:text-white">
                  {person.lastLoginAt ? formatDate(person.lastLoginAt) : "Nunca"}
                </dd>
              </div>
              {person.phone ? (
                <div>
                  <dt className="text-xs text-[#9e9e9e]">Teléfono</dt>
                  <dd className="text-[#212121] dark:text-white">{person.phone}</dd>
                </div>
              ) : null}
            </dl>
          </aside>
          <div className="min-w-0">
            <PersonPanels userId={person.id} />
          </div>
        </div>
      )}
    </div>
  );
}
