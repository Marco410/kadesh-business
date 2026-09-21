"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_USER_DETAIL_QUERY,
  UPDATE_ADMIN_USER_MUTATION,
  type AdminUserDetailResponse,
} from "./queries";
import { ROLE_LABELS } from "./constants";
import type { AdminUserDetail } from "./types";
import AdminUserBlogSubscriptions from "./AdminUserBlogSubscriptions";
import { AdminErrorState, formatPersonName } from "./ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileDraft = {
  name: string;
  lastName: string;
  secondLastName: string;
  email: string;
  phone: string;
  verified: boolean;
  roleIds: string[];
};

function toDraft(user: AdminUserDetail): ProfileDraft {
  return {
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    secondLastName: user.secondLastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    verified: Boolean(user.verified),
    roleIds: user.roles.map((r) => r.id),
  };
}

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id) => b.includes(id));
}

const inputClass =
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white";

export default function AdminUserEditor({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const isOpen = Boolean(userId);

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
              aria-label="Detalle del usuario"
              className="bg-white dark:bg-[#1e1e1e] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              {userId ? (
                <EditorBody key={userId} userId={userId} onClose={onClose} />
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function EditorBody({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [edits, setEdits] = useState<Partial<ProfileDraft>>({});
  const [saving, setSaving] = useState(false);

  const { data, error, refetch } = useQuery<AdminUserDetailResponse>(
    ADMIN_USER_DETAIL_QUERY,
    {
      variables: { id: userId },
      fetchPolicy: "network-only",
    },
  );

  const [updateUser] = useMutation(UPDATE_ADMIN_USER_MUTATION, {
    refetchQueries: ["AdminUsers"],
  });

  const user = data?.user ?? null;
  const roleOptions = data?.roles ?? [];

  const initial = useMemo(() => (user ? toDraft(user) : null), [user]);
  const draft = useMemo(
    () => (initial ? { ...initial, ...edits } : null),
    [initial, edits],
  );
  const emailError =
    draft && draft.email.trim() === ""
      ? "El correo es obligatorio."
      : draft && !EMAIL_PATTERN.test(draft.email.trim())
        ? "Revisa el formato del correo."
        : null;
  const nameError = draft && draft.name.trim() === "" ? "El nombre es obligatorio." : null;
  const hasChanges = Boolean(
    draft &&
      initial &&
      (draft.name.trim() !== initial.name ||
        draft.lastName.trim() !== initial.lastName ||
        draft.secondLastName.trim() !== initial.secondLastName ||
        draft.email.trim() !== initial.email ||
        draft.phone.trim() !== initial.phone ||
        draft.verified !== initial.verified ||
        !sameIds(draft.roleIds, initial.roleIds)),
  );
  const canSave = hasChanges && !emailError && !nameError && !saving;

  function patch(next: Partial<ProfileDraft>) {
    setEdits((prev) => ({ ...prev, ...next }));
  }

  function toggleRole(roleId: string) {
    if (!draft) return;
    patch({
      roleIds: draft.roleIds.includes(roleId)
        ? draft.roleIds.filter((id) => id !== roleId)
        : [...draft.roleIds, roleId],
    });
  }

  async function handleSave() {
    if (!draft || !initial || !user) return;

    const trimmed = {
      name: draft.name.trim(),
      lastName: draft.lastName.trim(),
      secondLastName: draft.secondLastName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    };
    const changes: Record<string, unknown> = {};
    if (trimmed.name !== initial.name) changes.name = trimmed.name;
    if (trimmed.lastName !== initial.lastName) changes.lastName = trimmed.lastName;
    if (trimmed.secondLastName !== initial.secondLastName) {
      changes.secondLastName = trimmed.secondLastName || null;
    }
    if (trimmed.email !== initial.email) changes.email = trimmed.email;
    if (trimmed.phone !== initial.phone) changes.phone = trimmed.phone;
    if (draft.verified !== initial.verified) changes.verified = draft.verified;
    if (!sameIds(draft.roleIds, initial.roleIds)) {
      changes.roles = { set: draft.roleIds.map((id) => ({ id })) };
    }

    setSaving(true);
    try {
      await updateUser({ variables: { where: { id: user.id }, data: changes } });
      await refetch();
      setEdits({});
      sileo.success({ title: "Usuario actualizado" });
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar el usuario",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start justify-between gap-3">
        {user ? (
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-[#212121] dark:text-white">
              {formatPersonName(user.name, user.lastName, user.secondLastName)}
            </h3>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1 break-all">
              {user.email ?? "Sin correo"}
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
          <AdminErrorState message="No se pudo cargar el usuario." />
        ) : !user || !draft ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-24 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
            <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
            <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoTile label="Empresa" value={user.company?.name ?? "Sin empresa"} />
              <InfoTile label="Alta" value={formatDateShort(user.createdAt, false)} />
              <InfoTile
                label="Último acceso"
                value={user.lastLoginAt ? formatDateShort(user.lastLoginAt, false) : "Nunca"}
              />
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white mb-3">
                Datos del usuario
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nombre" error={nameError}>
                  <input
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    disabled={saving}
                    autoComplete="off"
                    className={inputClass}
                  />
                </Field>
                <Field label="Apellido paterno">
                  <input
                    value={draft.lastName}
                    onChange={(e) => patch({ lastName: e.target.value })}
                    disabled={saving}
                    autoComplete="off"
                    className={inputClass}
                  />
                </Field>
                <Field label="Apellido materno">
                  <input
                    value={draft.secondLastName}
                    onChange={(e) => patch({ secondLastName: e.target.value })}
                    disabled={saving}
                    autoComplete="off"
                    className={inputClass}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    type="tel"
                    inputMode="tel"
                    value={draft.phone}
                    onChange={(e) => patch({ phone: e.target.value })}
                    disabled={saving}
                    autoComplete="off"
                    className={inputClass}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Correo" error={emailError}>
                    <input
                      type="email"
                      inputMode="email"
                      value={draft.email}
                      onChange={(e) => patch({ email: e.target.value })}
                      disabled={saving}
                      autoComplete="off"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <label className="mt-3 flex items-center gap-3 min-h-11 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.verified}
                  disabled={saving}
                  onChange={(e) => patch({ verified: e.target.checked })}
                  className="h-4 w-4 accent-orange-500"
                />
                <span className="text-sm text-[#212121] dark:text-white">
                  Cuenta verificada
                </span>
              </label>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
                Roles
              </h4>
              <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
                Definen a qué partes de la plataforma entra esta persona.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roleOptions.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-3 py-3 cursor-pointer min-h-11"
                  >
                    <input
                      type="checkbox"
                      checked={draft.roleIds.includes(role.id)}
                      disabled={saving}
                      onChange={() => toggleRole(role.id)}
                      className="h-4 w-4 accent-orange-500"
                    />
                    <span className="text-sm font-medium text-[#212121] dark:text-white">
                      {ROLE_LABELS[role.name] ?? role.name}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
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
                onClick={handleSave}
                className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar usuario"}
              </button>
            </div>

            <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-6 pb-2">
              <AdminUserBlogSubscriptions
                userId={user.id}
                userEmail={user.email}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fafafa] dark:bg-[#252525] p-3">
      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#212121] dark:text-white break-words">
        {value}
      </p>
    </div>
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
      <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
        {label}
      </span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600 dark:text-red-400 mt-1">
          {error}
        </span>
      ) : null}
    </label>
  );
}
