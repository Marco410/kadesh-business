"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  ADMIN_PET_PLACE_CATALOG_SERVICES_QUERY,
  ADMIN_PET_PLACE_DETAIL_QUERY,
  ADMIN_PET_PLACE_TYPES_QUERY,
  CREATE_PET_PLACE_SCHEDULES_MUTATION,
  CREATE_PET_PLACE_SERVICE_MUTATION,
  DELETE_PET_PLACE_SCHEDULES_MUTATION,
  UPDATE_PET_PLACE_MUTATION,
  type AdminPetPlaceCatalogServicesResponse,
  type AdminPetPlaceDetailResponse,
  type AdminPetPlaceTypesResponse,
} from "./queries";
import {
  PET_PLACE_PIPELINE_OPTIONS,
  PET_PLACE_SCHEDULE_HOURS,
  PET_PLACE_SERVICE_STATUS,
  PET_PLACE_TYPE_OPTIONS,
  PET_PLACE_WEEK_DAYS,
} from "./constants";
import type { AdminPetPlaceDetail } from "./types";
import { AdminErrorState } from "./ui";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { PIPELINE_STATUS } from "kadesh/constants/constans";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-60";

const textareaClass =
  "min-h-28 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-60";

type PlaceScheduleSlot = {
  key: string;
  day: string;
  timeIni: number;
  timeEnd: number;
};

type PlaceDraft = {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  website: string;
  email: string;
  street: string;
  municipality: string;
  state: string;
  country: string;
  cp: string;
  address: string;
  lat: string;
  lng: string;
  emergencies: boolean;
  parking: boolean;
  appointmentRequired: boolean;
  pipelineStatus: string;
  typeIds: string[];
  serviceIds: string[];
  schedules: PlaceScheduleSlot[];
};

let scheduleKey = 0;

function nextScheduleKey() {
  scheduleKey += 1;
  return `slot-${scheduleKey}`;
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function dayOrder(day: string) {
  const index = PET_PLACE_WEEK_DAYS.indexOf(
    day as (typeof PET_PLACE_WEEK_DAYS)[number],
  );
  return index === -1 ? PET_PLACE_WEEK_DAYS.length : index;
}

function toScheduleSlots(
  rows: AdminPetPlaceDetail["schedules"],
): PlaceScheduleSlot[] {
  return [...rows]
    .filter(
      (row) =>
        row.day &&
        Number.isInteger(row.timeIni) &&
        Number.isInteger(row.timeEnd),
    )
    .sort((a, b) => {
      const byDay = dayOrder(a.day ?? "") - dayOrder(b.day ?? "");
      if (byDay !== 0) return byDay;
      return (a.timeIni ?? 0) - (b.timeIni ?? 0);
    })
    .map((row) => ({
      key: row.id || nextScheduleKey(),
      day: row.day as string,
      timeIni: row.timeIni as number,
      timeEnd: row.timeEnd as number,
    }));
}

function scheduleSignature(slots: PlaceScheduleSlot[]) {
  return [...slots]
    .map((slot) => `${slot.day}|${slot.timeIni}|${slot.timeEnd}`)
    .sort()
    .join(";");
}

function scheduleError(slots: PlaceScheduleSlot[]): string | null {
  for (const slot of slots) {
    if (
      !PET_PLACE_WEEK_DAYS.includes(
        slot.day as (typeof PET_PLACE_WEEK_DAYS)[number],
      )
    ) {
      return "Hay un día de horario que no reconocemos.";
    }
    if (
      !Number.isInteger(slot.timeIni) ||
      !Number.isInteger(slot.timeEnd) ||
      slot.timeIni < 0 ||
      slot.timeIni > 23 ||
      slot.timeEnd < 0 ||
      slot.timeEnd > 23
    ) {
      return "Las horas deben estar entre 0 y 23.";
    }
    if (slot.timeEnd <= slot.timeIni) {
      return "La hora de cierre debe ser posterior a la de apertura.";
    }
  }
  return null;
}

function toDraft(place: AdminPetPlaceDetail): PlaceDraft {
  return {
    name: place.name ?? "",
    description: place.description ?? "",
    phone: place.phone ?? "",
    whatsapp: place.whatsapp ?? "",
    website: place.website ?? "",
    email: place.email ?? "",
    street: place.street ?? "",
    municipality: place.municipality ?? "",
    state: place.state ?? "",
    country: place.country ?? "",
    cp: place.cp ?? "",
    address: place.address ?? "",
    lat: place.lat ?? "",
    lng: place.lng ?? "",
    emergencies: Boolean(place.emergencies),
    parking: Boolean(place.parking),
    appointmentRequired: Boolean(place.appointmentRequired),
    pipelineStatus: place.pipelineStatus ?? PIPELINE_STATUS.DETECTADO,
    typeIds: place.types.map((t) => t.id),
    serviceIds: place.services.map((s) => s.id),
    schedules: toScheduleSlots(place.schedules ?? []),
  };
}

function sameIds(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(b);
  return a.every((id) => set.has(id));
}

function trimOrEmpty(value: string) {
  return value.trim();
}

export default function AdminPetPlaceEditor({
  placeId,
  onClose,
  onSaved,
}: {
  placeId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const isOpen = Boolean(placeId);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            data-body-scroll-lock
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
              role="dialog"
              aria-modal="true"
              aria-label="Editar veterinaria"
              className="bg-white dark:bg-[#1e1e1e] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              {placeId ? (
                <EditorBody
                  key={placeId}
                  placeId={placeId}
                  onClose={onClose}
                  onSaved={onSaved}
                />
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function EditorBody({
  placeId,
  onClose,
  onSaved,
}: {
  placeId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [edits, setEdits] = useState<Partial<PlaceDraft>>({});
  const [saving, setSaving] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [creatingService, setCreatingService] = useState(false);
  const [extraServices, setExtraServices] = useState<
    Array<{ id: string; name: string | null }>
  >([]);
  const debouncedServiceSearch = useDebouncedValue(serviceSearch, 200);

  const { data, error, refetch } = useQuery<AdminPetPlaceDetailResponse>(
    ADMIN_PET_PLACE_DETAIL_QUERY,
    {
      variables: { id: placeId },
      fetchPolicy: "network-only",
    },
  );

  const { data: typesData } = useQuery<AdminPetPlaceTypesResponse>(
    ADMIN_PET_PLACE_TYPES_QUERY,
    { fetchPolicy: "cache-first" },
  );

  const catalogWhere = useMemo(
    () => ({
      AND: [
        { status: { equals: PET_PLACE_SERVICE_STATUS.APPROVED } },
        { active: { equals: true } },
      ],
    }),
    [],
  );

  const { data: catalogData, refetch: refetchCatalog } =
    useQuery<AdminPetPlaceCatalogServicesResponse>(
      ADMIN_PET_PLACE_CATALOG_SERVICES_QUERY,
      {
        variables: { where: catalogWhere },
        fetchPolicy: "network-only",
      },
    );

  const [updatePetPlace] = useMutation(UPDATE_PET_PLACE_MUTATION);
  const [createService] = useMutation(CREATE_PET_PLACE_SERVICE_MUTATION);
  const [deleteSchedules] = useMutation(DELETE_PET_PLACE_SCHEDULES_MUTATION);
  const [createSchedules] = useMutation(CREATE_PET_PLACE_SCHEDULES_MUTATION);

  const place = data?.petPlace ?? null;
  const typeOptions = typesData?.petPlaceTypes ?? [];
  const catalog = catalogData?.petPlaceServices ?? [];

  const initial = useMemo(() => (place ? toDraft(place) : null), [place]);
  const draft = useMemo(
    () => (initial ? { ...initial, ...edits } : null),
    [initial, edits],
  );

  const nameError =
    draft && draft.name.trim() === "" ? "El nombre es obligatorio." : null;
  const descriptionError =
    draft && draft.description.trim() === ""
      ? "La descripción es obligatoria."
      : null;
  const emailError =
    draft && draft.email.trim() && !EMAIL_PATTERN.test(draft.email.trim())
      ? "Revisa el formato del correo."
      : null;
  const typesError =
    draft && typeOptions.length > 0 && draft.typeIds.length === 0
      ? "Elige al menos un tipo de negocio."
      : null;

  const hasChanges = Boolean(
    draft &&
      initial &&
      (trimOrEmpty(draft.name) !== trimOrEmpty(initial.name) ||
        trimOrEmpty(draft.description) !== trimOrEmpty(initial.description) ||
        trimOrEmpty(draft.phone) !== trimOrEmpty(initial.phone) ||
        trimOrEmpty(draft.whatsapp) !== trimOrEmpty(initial.whatsapp) ||
        trimOrEmpty(draft.website) !== trimOrEmpty(initial.website) ||
        trimOrEmpty(draft.email) !== trimOrEmpty(initial.email) ||
        trimOrEmpty(draft.street) !== trimOrEmpty(initial.street) ||
        trimOrEmpty(draft.municipality) !== trimOrEmpty(initial.municipality) ||
        trimOrEmpty(draft.state) !== trimOrEmpty(initial.state) ||
        trimOrEmpty(draft.country) !== trimOrEmpty(initial.country) ||
        trimOrEmpty(draft.cp) !== trimOrEmpty(initial.cp) ||
        trimOrEmpty(draft.address) !== trimOrEmpty(initial.address) ||
        trimOrEmpty(draft.lat) !== trimOrEmpty(initial.lat) ||
        trimOrEmpty(draft.lng) !== trimOrEmpty(initial.lng) ||
        draft.emergencies !== initial.emergencies ||
        draft.parking !== initial.parking ||
        draft.appointmentRequired !== initial.appointmentRequired ||
        draft.pipelineStatus !== initial.pipelineStatus ||
        !sameIds(draft.typeIds, initial.typeIds) ||
        !sameIds(draft.serviceIds, initial.serviceIds) ||
        scheduleSignature(draft.schedules) !==
          scheduleSignature(initial.schedules)),
  );

  const hoursError = draft ? scheduleError(draft.schedules) : null;

  const canSave =
    Boolean(hasChanges) &&
    !nameError &&
    !descriptionError &&
    !emailError &&
    !typesError &&
    !hoursError &&
    !saving;

  function patch(next: Partial<PlaceDraft>) {
    setEdits((prev) => ({ ...prev, ...next }));
  }

  function toggleType(typeId: string) {
    if (!draft) return;
    patch({
      typeIds: draft.typeIds.includes(typeId)
        ? draft.typeIds.filter((id) => id !== typeId)
        : [...draft.typeIds, typeId],
    });
  }

  function updateSchedule(
    key: string,
    next: Partial<Pick<PlaceScheduleSlot, "day" | "timeIni" | "timeEnd">>,
  ) {
    if (!draft) return;
    patch({
      schedules: draft.schedules.map((slot) =>
        slot.key === key ? { ...slot, ...next } : slot,
      ),
    });
  }

  function removeSchedule(key: string) {
    if (!draft) return;
    patch({ schedules: draft.schedules.filter((slot) => slot.key !== key) });
  }

  function addSchedule() {
    if (!draft) return;
    patch({
      schedules: [
        ...draft.schedules,
        { key: nextScheduleKey(), day: "Lunes", timeIni: 9, timeEnd: 18 },
      ],
    });
  }

  function toggleService(serviceId: string) {
    if (!draft) return;
    patch({
      serviceIds: draft.serviceIds.includes(serviceId)
        ? draft.serviceIds.filter((id) => id !== serviceId)
        : [...draft.serviceIds, serviceId],
    });
  }

  const serviceById = useMemo(() => {
    const map = new Map<string, { id: string; name: string | null }>();
    for (const row of place?.services ?? []) map.set(row.id, row);
    for (const row of catalog) map.set(row.id, row);
    for (const row of extraServices) map.set(row.id, row);
    return map;
  }, [place?.services, catalog, extraServices]);

  const filteredCatalog = useMemo(() => {
    const q = debouncedServiceSearch.trim().toLowerCase();
    const selected = new Set(draft?.serviceIds ?? []);
    return catalog
      .filter((row) => !selected.has(row.id))
      .filter((row) => {
        if (!q) return true;
        return (
          (row.name ?? "").toLowerCase().includes(q) ||
          (row.description ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 40);
  }, [catalog, draft?.serviceIds, debouncedServiceSearch]);

  async function handleCreateService() {
    const name = newServiceName.trim();
    if (!name) {
      sileo.warning({ title: "Escribe el nombre del servicio" });
      return;
    }
    setCreatingService(true);
    try {
      const { data: created } = await createService({
        variables: {
          data: {
            name,
            description: newServiceDescription.trim() || undefined,
            status: PET_PLACE_SERVICE_STATUS.APPROVED,
            active: true,
          },
        },
      });
      const service = created?.createPetPlaceService;
      if (!service?.id) {
        sileo.error({ title: "No se pudo crear el servicio" });
        return;
      }
      if (draft && !draft.serviceIds.includes(service.id)) {
        patch({ serviceIds: [...draft.serviceIds, service.id] });
      }
      setExtraServices((prev) =>
        prev.some((row) => row.id === service.id)
          ? prev
          : [...prev, { id: service.id, name: service.name ?? name }],
      );
      setNewServiceName("");
      setNewServiceDescription("");
      await refetchCatalog();
      sileo.success({
        title: "Servicio creado",
        description: "Quedó en el catálogo y se agregó a esta ficha.",
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo crear el servicio",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setCreatingService(false);
    }
  }

  async function handleSave() {
    if (!draft || !initial || !place) return;

    const changes: Record<string, unknown> = {};
    const assignIfChanged = (key: keyof PlaceDraft, value: string) => {
      if (value !== trimOrEmpty(String(initial[key] ?? ""))) {
        changes[key] = value;
      }
    };

    assignIfChanged("name", draft.name.trim());
    assignIfChanged("description", draft.description.trim());
    assignIfChanged("phone", draft.phone.trim());
    assignIfChanged("whatsapp", draft.whatsapp.trim());
    assignIfChanged("website", draft.website.trim());
    assignIfChanged("email", draft.email.trim());
    assignIfChanged("street", draft.street.trim());
    assignIfChanged("municipality", draft.municipality.trim());
    assignIfChanged("state", draft.state.trim());
    assignIfChanged("country", draft.country.trim());
    assignIfChanged("cp", draft.cp.trim());
    assignIfChanged("address", draft.address.trim());
    assignIfChanged("lat", draft.lat.trim());
    assignIfChanged("lng", draft.lng.trim());

    if (draft.emergencies !== initial.emergencies) {
      changes.emergencies = draft.emergencies;
    }
    if (draft.parking !== initial.parking) {
      changes.parking = draft.parking;
    }
    if (draft.appointmentRequired !== initial.appointmentRequired) {
      changes.appointmentRequired = draft.appointmentRequired;
    }
    if (draft.pipelineStatus !== initial.pipelineStatus) {
      changes.pipelineStatus = draft.pipelineStatus;
    }
    if (!sameIds(draft.typeIds, initial.typeIds)) {
      if (typeOptions.length === 0) {
        sileo.warning({
          title: "Aún no cargan los tipos",
          description: "Espera un momento e intenta guardar de nuevo.",
        });
        return;
      }
      changes.types = { set: draft.typeIds.map((id) => ({ id })) };
    }
    if (!sameIds(draft.serviceIds, initial.serviceIds)) {
      changes.services = { set: draft.serviceIds.map((id) => ({ id })) };
    }

    const schedulesChanged =
      scheduleSignature(draft.schedules) !== scheduleSignature(initial.schedules);
    if (schedulesChanged) {
      const hoursIssue = scheduleError(draft.schedules);
      if (hoursIssue) {
        sileo.warning({ title: hoursIssue });
        return;
      }
    }

    if (Object.keys(changes).length === 0 && !schedulesChanged) return;

    setSaving(true);
    try {
      if (Object.keys(changes).length > 0) {
        await updatePetPlace({
          variables: { where: { id: place.id }, data: changes },
        });
      }
      if (schedulesChanged) {
        const existingIds = (place.schedules ?? [])
          .map((row) => row.id)
          .filter(Boolean);
        if (existingIds.length > 0) {
          await deleteSchedules({
            variables: { where: existingIds.map((id) => ({ id })) },
          });
        }
        if (draft.schedules.length > 0) {
          await createSchedules({
            variables: {
              data: draft.schedules.map((slot) => ({
                day: slot.day,
                timeIni: slot.timeIni,
                timeEnd: slot.timeEnd,
                pet_place: { connect: { id: place.id } },
              })),
            },
          });
        }
      }
      await refetch();
      setEdits({});
      onSaved?.();
      sileo.success({ title: "Ficha actualizada" });
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar la ficha",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  const resolvedTypeOptions = typeOptions;

  return (
    <>
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start justify-between gap-3">
        {place ? (
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-[#212121] dark:text-white">
              Editar ficha
            </h3>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1 truncate">
              {place.name}
            </p>
          </div>
        ) : (
          <div className="h-12 w-48 rounded-lg bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
        )}
        <button
          type="button"
          onClick={onClose}
          className="h-11 w-11 shrink-0 rounded-xl text-2xl text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] cursor-pointer"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="px-4 sm:px-6 py-5 flex flex-col gap-6">
        {error ? (
          <AdminErrorState message="No se pudo cargar la ficha." />
        ) : !place || !draft ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
            <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
            <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
          </div>
        ) : (
          <>
            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
                Datos públicos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Field label="Nombre" error={nameError}>
                    <input
                      value={draft.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      disabled={saving}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Descripción" error={descriptionError}>
                    <textarea
                      value={draft.description}
                      onChange={(e) => patch({ description: e.target.value })}
                      disabled={saving}
                      className={textareaClass}
                    />
                  </Field>
                </div>
                <Field label="Teléfono">
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => patch({ phone: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    type="tel"
                    value={draft.whatsapp}
                    onChange={(e) => patch({ whatsapp: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="Correo" error={emailError}>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => patch({ email: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="Sitio web">
                  <input
                    type="url"
                    value={draft.website}
                    onChange={(e) => patch({ website: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                    placeholder="https://"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
                Ubicación
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Field label="Calle y número">
                    <input
                      value={draft.street}
                      onChange={(e) => patch({ street: e.target.value })}
                      disabled={saving}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Municipio">
                  <input
                    value={draft.municipality}
                    onChange={(e) => patch({ municipality: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="Estado">
                  <input
                    value={draft.state}
                    onChange={(e) => patch({ state: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="País">
                  <input
                    value={draft.country}
                    onChange={(e) => patch({ country: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="C.P.">
                  <input
                    value={draft.cp}
                    onChange={(e) => patch({ cp: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Dirección completa">
                    <input
                      value={draft.address}
                      onChange={(e) => patch({ address: e.target.value })}
                      disabled={saving}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Latitud">
                  <input
                    value={draft.lat}
                    onChange={(e) => patch({ lat: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
                <Field label="Longitud">
                  <input
                    value={draft.lng}
                    onChange={(e) => patch({ lng: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
                Características
              </h4>
              <div className="flex flex-col gap-2">
                <Toggle
                  label="Atiende urgencias 24/7"
                  checked={draft.emergencies}
                  disabled={saving}
                  onChange={(checked) => patch({ emergencies: checked })}
                />
                <Toggle
                  label="Tiene estacionamiento"
                  checked={draft.parking}
                  disabled={saving}
                  onChange={(checked) => patch({ parking: checked })}
                />
                <Toggle
                  label="Solo con cita"
                  checked={draft.appointmentRequired}
                  disabled={saving}
                  onChange={(checked) => patch({ appointmentRequired: checked })}
                />
              </div>
              <div className="mt-3">
                <Field label="Pipeline">
                  <select
                    value={draft.pipelineStatus}
                    onChange={(e) => patch({ pipelineStatus: e.target.value })}
                    disabled={saving}
                    className={inputClass}
                  >
                    {PET_PLACE_PIPELINE_OPTIONS.filter((o) => o.value !== "all").map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                Horario
              </h4>
              <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                Horario semanal de apertura. Un día sin fila está cerrado. La
                hora de cierre tiene que ser después de la de apertura.
              </p>
              {hoursError ? (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  {hoursError}
                </p>
              ) : null}
              {draft.schedules.length === 0 ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-3">
                  Sin horario. La ficha se muestra cerrada.
                </p>
              ) : (
                <ul className="flex flex-col gap-2 mb-3">
                  {draft.schedules.map((slot) => (
                    <li
                      key={slot.key}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <label className="block">
                        <span className="sr-only">Día</span>
                        <select
                          value={slot.day}
                          disabled={saving}
                          onChange={(e) =>
                            updateSchedule(slot.key, { day: e.target.value })
                          }
                          className={inputClass}
                        >
                          {PET_PLACE_WEEK_DAYS.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="sr-only">Apertura</span>
                        <select
                          value={slot.timeIni}
                          disabled={saving}
                          onChange={(e) =>
                            updateSchedule(slot.key, {
                              timeIni: Number(e.target.value),
                            })
                          }
                          className={inputClass}
                        >
                          {PET_PLACE_SCHEDULE_HOURS.map((hour) => (
                            <option key={hour} value={hour}>
                              Abre {formatHour(hour)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="sr-only">Cierre</span>
                        <select
                          value={slot.timeEnd}
                          disabled={saving}
                          onChange={(e) =>
                            updateSchedule(slot.key, {
                              timeEnd: Number(e.target.value),
                            })
                          }
                          className={inputClass}
                        >
                          {PET_PLACE_SCHEDULE_HOURS.map((hour) => (
                            <option key={hour} value={hour}>
                              Cierra {formatHour(hour)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => removeSchedule(slot.key)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#424242] dark:text-[#e0e0e0] cursor-pointer disabled:opacity-60"
                        aria-label={`Quitar horario de ${slot.day}`}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={addSchedule}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-sm font-semibold cursor-pointer disabled:opacity-60 hover:border-orange-300"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} />
                Agregar horario
              </button>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                Tipo de negocio
              </h4>
              <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                Al menos uno. Define cómo se clasifica en el directorio.
              </p>
              {typesError ? (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  {typesError}
                </p>
              ) : null}
              {typeOptions.length === 0 ? (
                <div className="space-y-2">
                  {place.types.length === 0 ? (
                    <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                      Cargando tipos…
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {place.types.map((type) => (
                        <li
                          key={type.id}
                          className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 py-2 text-sm text-[#212121] dark:text-white"
                        >
                          {type.label ??
                            PET_PLACE_TYPE_OPTIONS.find(
                              (o) => o.value === type.value,
                            )?.label ??
                            type.value ??
                            "Tipo"}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Cuando cargue el catálogo podrás cambiar los tipos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resolvedTypeOptions.map((type) => {
                    const label =
                      type.label ??
                      PET_PLACE_TYPE_OPTIONS.find((o) => o.value === type.value)
                        ?.label ??
                      type.value ??
                      "Tipo";
                    return (
                      <label
                        key={type.id}
                        className="flex items-center gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 py-3 min-h-11 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={draft.typeIds.includes(type.id)}
                          disabled={saving}
                          onChange={() => toggleType(type.id)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        <span className="text-sm font-medium text-[#212121] dark:text-white">
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                Servicios
              </h4>
              <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                Los que salen en la ficha pública. Puedes quitar, agregar del
                catálogo o crear uno nuevo.
              </p>

              {draft.serviceIds.length === 0 ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-3">
                  Esta ficha aún no tiene servicios.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2 mb-4">
                  {draft.serviceIds.map((id) => {
                    const row = serviceById.get(id);
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => toggleService(id)}
                          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 text-sm text-[#212121] dark:text-white cursor-pointer disabled:opacity-60"
                          title="Quitar de la ficha"
                        >
                          {row?.name ?? "Servicio"}
                          <HugeiconsIcon icon={Cancel01Icon} size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <label className="block mb-2">
                <span className="sr-only">Buscar servicios del catálogo</span>
                <input
                  type="search"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Buscar en el catálogo para agregar"
                  disabled={saving}
                  className={inputClass}
                />
              </label>

              {filteredCatalog.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a] mb-4">
                  {filteredCatalog.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleService(row.id)}
                        className="w-full text-left px-3 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer disabled:opacity-60"
                      >
                        <span className="font-medium text-[#212121] dark:text-white">
                          {row.name ?? "Servicio"}
                        </span>
                        {row.description ? (
                          <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5 line-clamp-2">
                            {row.description}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : debouncedServiceSearch.trim().length >= 1 ? (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-4">
                  No hay más servicios con ese nombre.
                </p>
              ) : null}

              <div className="rounded-xl border border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] p-3 sm:p-4">
                <p className="text-sm font-semibold text-[#212121] dark:text-white mb-2">
                  Crear servicio nuevo
                </p>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mb-3">
                  Entra al catálogo aprobado y se marca en esta clínica.
                </p>
                <div className="flex flex-col gap-3">
                  <Field label="Nombre">
                    <input
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      disabled={saving || creatingService}
                      className={inputClass}
                      placeholder="Ej. Cirugía ortopédica"
                    />
                  </Field>
                  <Field label="Descripción (opcional)">
                    <textarea
                      value={newServiceDescription}
                      onChange={(e) => setNewServiceDescription(e.target.value)}
                      disabled={saving || creatingService}
                      className={textareaClass}
                    />
                  </Field>
                  <button
                    type="button"
                    disabled={
                      saving || creatingService || !newServiceName.trim()
                    }
                    onClick={() => void handleCreateService()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:border-orange-300"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={18} />
                    {creatingService ? "Creando..." : "Crear y agregar"}
                  </button>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pb-2">
              <button
                type="button"
                disabled={!hasChanges || saving}
                onClick={() => setEdits({})}
                className="h-11 rounded-xl px-4 text-sm font-semibold border border-[#e0e0e0] dark:border-[#3a3a3a] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Descartar cambios
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => void handleSave()}
                className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar ficha"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 min-h-11 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-orange-500"
      />
      <span className="text-sm text-[#212121] dark:text-white">{label}</span>
    </label>
  );
}
