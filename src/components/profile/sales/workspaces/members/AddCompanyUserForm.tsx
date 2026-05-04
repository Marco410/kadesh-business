"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, type InternalRefetchQueriesInclude } from "@apollo/client";
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
import { sileo } from "sileo";

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

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

  useEffect(() => {
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
  }, [editingId, profileData?.user]);

  useEffect(() => {
    if (editingId) return;
    setName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setBirthday("");
  }, [editingId]);

  const { data: rolesData } = useQuery<RolesByNamesResponse, RolesByNamesVariables>(
    ROLES_BY_NAMES_QUERY,
    {
      variables: {
        where: { name: { in: [Role.USER, Role.USER_COMPANY] } },
      },
    }
  );

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
        title: isEmailTaken ? "Correo ya registrado" : "No se pudo agregar el usuario",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      sileo.error({ title: "Sin empresa", description: "No hay empresa asignada." });
      return;
    }
    const nameTrim = name.trim();
    const lastNameTrim = lastName.trim();
    const emailTrim = email.trim();
    if (!nameTrim || !lastNameTrim || !emailTrim || !phone.trim() || !birthday.trim()) {
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
              birthday: birthday.trim() ? birthday.trim().slice(0, 10) : undefined,
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

  const pad = compact ? "p-3 space-y-3" : "p-4 space-y-4";

  return (
    <div
      className={`rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden h-fit ${compact ? "text-sm" : ""}`}
    >
      <h3
        className={`font-bold text-[#212121] dark:text-[#ffffff] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a] ${compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-lg"}`}
      >
        {editingId ? "Editar usuario" : "Nuevo usuario (empresa)"}
      </h3>
      <form onSubmit={handleSubmit} className={pad}>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClassName}
            placeholder="Nombre"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Apellido paterno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClassName}
            placeholder="Apellido"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            placeholder="usuario@empresa.com"
            required
          />
          <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Se usará para iniciar sesión. Debe ser único.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Contraseña {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            placeholder={isEditMode ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Confirmar contraseña {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClassName}
            placeholder="Repite la contraseña"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClassName}
            placeholder="10 dígitos"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1">
            Fecha de nacimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={inputClassName}
            required
          />
        </div>
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          Rol asignado al crear: <span className="font-medium">user_company</span> (acceso de empresa).
        </p>

        <div className="pt-1 flex flex-wrap gap-2">
          {editingId && (
            <button
              type="button"
              onClick={() => onEditingIdChange(null)}
              disabled={submitting}
              className="inline-flex justify-center px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#e0e0e0] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || !companyId}
            className="inline-flex justify-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Guardando…"
              : editingId
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
