"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  type InternalRefetchQueriesInclude,
} from "@apollo/client";
import {
  ROLES_BY_NAMES_QUERY,
  CREATE_SALES_PERSON_MUTATION,
  UPDATE_VENDEDOR_MUTATION,
  type RolesByNamesResponse,
  type RolesByNamesVariables,
  type CreateSalesPersonVariables,
  type CreateSalesPersonResponse,
  type UpdateVendedorVariables,
  type UpdateVendedorResponse,
} from "kadesh/components/profile/sales/queries";
import {
  USER_BASIC_PROFILE_QUERY,
  type UserBasicProfileResponse,
  type UserBasicProfileVariables,
} from "kadesh/components/profile/sales/workspaces/queries";
import { Role } from "kadesh/constants/constans";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import { sileo } from "sileo";

const fieldClass =
  "w-full min-h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

const labelClass =
  "block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1.5";

export interface AddCompanyUserFormProps {
  companyId: string | null;
  onUserCreated?: (userId: string) => void;
  editingId: string | null;
  onEditingIdChange: (id: string | null) => void;
  compact?: boolean;
  listRefetchQueries?: InternalRefetchQueriesInclude;
}

export default function AddCompanyUserForm({
  companyId,
  onUserCreated,
  editingId,
  onEditingIdChange,
  compact,
  listRefetchQueries,
}: AddCompanyUserFormProps) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");

  const { data: profileData } = useQuery<
    UserBasicProfileResponse,
    UserBasicProfileVariables
  >(USER_BASIC_PROFILE_QUERY, {
    variables: { where: { id: editingId ?? "" } },
    skip: !editingId,
    fetchPolicy: "network-only",
  });

  useApplyOnKeyChange(
    [
      editingId,
      profileData?.user?.name,
      profileData?.user?.lastName,
      profileData?.user?.email,
      profileData?.user?.phone,
      profileData?.user?.birthday,
    ].join("\0"),
    () => {
      if (!editingId) return;
      const u = profileData?.user;
      if (!u) return;
      setName(u.name ?? "");
      setLastName(u.lastName ?? "");
      setEmail(u.email ?? "");
      setPhone(u.phone ?? "");
      setBirthday(u.birthday ? u.birthday.slice(0, 10) : "");
      setPassword("");
      setConfirmPassword("");
    },
  );

  useApplyOnKeyChange(editingId, () => {
    if (editingId) return;
    setName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setBirthday("");
  });

  const { data: rolesData } = useQuery<
    RolesByNamesResponse,
    RolesByNamesVariables
  >(ROLES_BY_NAMES_QUERY, {
    variables: {
      where: { name: { in: [Role.USER, Role.USER_COMPANY] } },
    },
  });

  const [createUser, { loading: creating }] = useMutation<
    CreateSalesPersonResponse,
    CreateSalesPersonVariables
  >(CREATE_SALES_PERSON_MUTATION, {
    refetchQueries: listRefetchQueries,
    awaitRefetchQueries: Boolean(listRefetchQueries?.length),
    onCompleted: (data) => {
      const id = data.createUser?.id;
      sileo.success({ title: "Usuario agregado" });
      if (id) onUserCreated?.(id);
      onEditingIdChange(null);
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setBirthday("");
    },
    onError: (err) => {
      const msg = err.message ?? "";
      const isEmailTaken =
        msg.includes("Unique constraint failed") &&
        (msg.includes("email") || msg.includes("username"));
      sileo.error({
        title: isEmailTaken
          ? "Correo ya registrado"
          : "No se pudo agregar el usuario",
        description: isEmailTaken
          ? "Usa otro correo o inicia sesión con esa cuenta."
          : msg || "Intenta de nuevo.",
      });
    },
  });

  const [updateUser, { loading: updating }] = useMutation<
    UpdateVendedorResponse,
    UpdateVendedorVariables
  >(UPDATE_VENDEDOR_MUTATION, {
    refetchQueries: listRefetchQueries,
    awaitRefetchQueries: Boolean(listRefetchQueries?.length),
    onCompleted: () => {
      sileo.success({ title: "Cambios guardados" });
      onEditingIdChange(null);
      setPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      sileo.error({
        title: "No se pudieron guardar los cambios",
        description: err.message ?? "Intenta de nuevo.",
      });
    },
  });

  const isEditMode = Boolean(editingId);
  const submitting = creating || updating;
  const passwordMismatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      sileo.error({
        title: "Sin empresa",
        description: "No hay empresa asignada.",
      });
      return;
    }
    const nameTrim = name.trim();
    const lastNameTrim = lastName.trim();
    const emailTrim = email.trim();
    if (
      !nameTrim ||
      !lastNameTrim ||
      !emailTrim ||
      !phone.trim() ||
      !birthday.trim()
    ) {
      sileo.warning({
        title: "Campos requeridos",
        description:
          "Nombre, apellido, teléfono, fecha de nacimiento y correo son obligatorios.",
      });
      return;
    }
    if (password.length > 0 && password !== confirmPassword) {
      sileo.warning({
        title: "Contraseñas no coinciden",
        description: "La contraseña y la confirmación deben ser iguales.",
      });
      return;
    }
    if (!isEditMode && (!password || password !== confirmPassword)) {
      sileo.warning({
        title: "Contraseña",
        description: "Define una contraseña y confírmala para el nuevo usuario.",
      });
      return;
    }

    try {
      if (isEditMode && editingId) {
        const updateData: UpdateVendedorVariables["data"] = {
          name: nameTrim,
          lastName: lastNameTrim || null,
          email: emailTrim || null,
          phone: phone.trim() || null,
          birthday: birthday.trim() ? birthday.trim().slice(0, 10) : null,
        };
        if (password) updateData.password = password;
        await updateUser({
          variables: { where: { id: editingId }, data: updateData },
        });
      } else {
        const roleIds = rolesData?.roles?.map((r) => ({ id: r.id })) ?? [];
        if (roleIds.length < 2) {
          sileo.error({
            title: "Roles no disponibles",
            description: "No se encontraron los roles usuario y user_company.",
          });
          return;
        }
        await createUser({
          variables: {
            data: {
              name: nameTrim,
              lastName: lastNameTrim || undefined,
              email: emailTrim,
              password: password || undefined,
              phone: phone.trim() || undefined,
              birthday: birthday.trim()
                ? birthday.trim().slice(0, 10)
                : undefined,
              product: "saas",
              roles: { connect: roleIds },
              company: { connect: { id: companyId } },
            },
          },
        });
      }
    } catch {
      // onError
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-500/[0.07] via-white to-emerald-500/[0.04] shadow-sm dark:border-orange-900/40 dark:from-orange-500/10 dark:via-[#1e1e1e] dark:to-emerald-500/[0.06] ${compact ? "" : ""}`}
    >
      <div className="border-b border-orange-200/50 px-4 py-3 dark:border-orange-900/30 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/80 dark:text-orange-300/80">
          {isEditMode ? "Editando" : "Nueva alta"}
        </p>
        <h3 className="mt-0.5 text-base font-bold text-[#212121] dark:text-white">
          {isEditMode ? "Editar usuario" : "Usuario de empresa"}
        </h3>
        <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
          {isEditMode
            ? "La contraseña solo cambia si escribes una nueva."
            : "Rol al crear: acceso de empresa (user_company). El correo es su inicio de sesión."}
        </p>
      </div>

      <div className="space-y-5 px-4 py-4 sm:px-5">
        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
            Identidad
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="company-user-name" className={labelClass}>
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="company-user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Nombre"
                autoComplete="given-name"
                required
              />
            </div>
            <div>
              <label htmlFor="company-user-lastname" className={labelClass}>
                Apellido paterno <span className="text-red-500">*</span>
              </label>
              <input
                id="company-user-lastname"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
                placeholder="Apellido"
                autoComplete="family-name"
                required
              />
            </div>
            <div>
              <label htmlFor="company-user-phone" className={labelClass}>
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                id="company-user-phone"
                type="tel"
                value={phone}
                maxLength={10}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className={fieldClass}
                placeholder="5512345678"
                inputMode="numeric"
                autoComplete="tel"
                required
              />
            </div>
            <div>
              <label htmlFor="company-user-birthday" className={labelClass}>
                Fecha de nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                id="company-user-birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
            Acceso al panel
          </h4>
          <div>
            <label htmlFor="company-user-email" className={labelClass}>
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="company-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="usuario@empresa.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="company-user-password" className={labelClass}>
                Contraseña{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                id="company-user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                placeholder={
                  isEditMode
                    ? "Dejar en blanco para no cambiar"
                    : "Mínimo 8 caracteres"
                }
                autoComplete="new-password"
              />
            </div>
            <div>
              <label
                htmlFor="company-user-confirm-password"
                className={labelClass}
              >
                Confirmar{" "}
                {(!isEditMode || password.length > 0) && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                id="company-user-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={fieldClass}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>
          {passwordMismatch && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Las contraseñas no coinciden.
            </p>
          )}
        </section>

        {!companyId && (
          <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Sin empresa asignada. No podrás guardar.
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-[#e8e8e8] pt-4 dark:border-[#333] sm:flex-row sm:justify-end">
          {editingId && (
            <button
              type="button"
              onClick={() => onEditingIdChange(null)}
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e0e0e0] bg-white px-4 text-sm font-medium text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#e0e0e0] dark:hover:bg-[#333]"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || !companyId || passwordMismatch}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Guardando…"
              : editingId
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </div>
      </div>
    </form>
  );
}
