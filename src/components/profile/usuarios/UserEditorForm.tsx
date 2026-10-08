"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import {
  ROLES_BY_NAMES_QUERY,
  type RolesByNamesResponse,
  type RolesByNamesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  CREATE_COMPANY_MANAGED_USER_MUTATION,
  UPDATE_COMPANY_MANAGED_USER_MUTATION,
  type CompanyUserManageRow,
  type CreateCompanyManagedUserResponse,
  type CreateCompanyManagedUserVariables,
  type UpdateCompanyManagedUserResponse,
  type UpdateCompanyManagedUserVariables,
} from "kadesh/components/profile/usuarios/queries";
import {
  ASSIGNABLE_COMPANY_ROLES,
  ASSIGNABLE_ROLE_LABELS,
  normalizePermissions,
  PERMISSION_MODULES,
  type AssignableCompanyRole,
  type PermissionKey,
} from "kadesh/components/profile/usuarios/permissions";
import { Role } from "kadesh/constants/constans";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import { cn } from "kadesh/utils/cn";
import { sileo } from "sileo";

const inputClassName =
  "w-full min-h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

const ROLE_HINTS: Record<AssignableCompanyRole, string> = {
  gerencia: "Administra usuarios y permisos de la empresa.",
  vendedor: "Aparece en asignaciones de clientes y el CRM.",
  user_company: "Acceso de empresa (espacios y bolsa compartida).",
};

/** Texto del botón ? en cada tarjeta de rol (tap, no solo hover). */
const ROLE_HELP: Record<AssignableCompanyRole, string> = {
  gerencia:
    "Puede abrir Usuarios, dar de alta personas y asignar roles y permisos. No administra al dueño de la empresa ni a admins de plataforma. Combínalo con Vendedor si también vende.",
  vendedor:
    "Sale en la lista para asignar clientes y trabaja el CRM (pipeline, actividades, propuestas). Sin este rol no aparece como opción al asignar un cliente. No implica ver toda la bolsa: eso lo marcan los permisos (o Usuario de empresa en legado).",
  user_company:
    "Pertenece a la empresa para espacios de trabajo y, si no hay permisos finos, ver la bolsa compartida de clientes. No vende por sí solo ni administra usuarios: úsalo solo o junto con Gerencia / Vendedor según el trabajo de la persona.",
};

const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) =>
  m.permissions.map((p) => p.key),
);

export type UserEditorFormProps = {
  companyId: string;
  editingUser: CompanyUserManageRow | null;
  onDone: () => void;
  onCancel: () => void;
  listRefetch: () => void | Promise<unknown>;
};

function rolesFromUser(user: CompanyUserManageRow | null): AssignableCompanyRole[] {
  if (!user) return ["user_company"];
  return ASSIGNABLE_COMPANY_ROLES.filter((role) =>
    user.roles.some((r) => r.name === role),
  );
}

export default function UserEditorForm({
  companyId,
  editingUser,
  onDone,
  onCancel,
  listRefetch,
}: UserEditorFormProps) {
  const isEditMode = Boolean(editingUser);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AssignableCompanyRole[]>([
    "user_company",
  ]);
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionKey[]
  >([]);
  const [openRoleHelp, setOpenRoleHelp] =
    useState<AssignableCompanyRole | null>(null);

  useApplyOnKeyChange(editingUser?.id ?? "new", () => {
    if (!editingUser) {
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setBirthday("");
      setSelectedRoles(["user_company"]);
      setSelectedPermissions([]);
      setOpenRoleHelp(null);
      return;
    }
    setOpenRoleHelp(null);
    setName(editingUser.name ?? "");
    setLastName(editingUser.lastName ?? "");
    setEmail(editingUser.email ?? "");
    setPassword("");
    setConfirmPassword("");
    setPhone(editingUser.phone ?? "");
    setBirthday(editingUser.birthday ? editingUser.birthday.slice(0, 10) : "");
    const fromUser = rolesFromUser(editingUser);
    setSelectedRoles(fromUser.length > 0 ? fromUser : ["user_company"]);
    setSelectedPermissions(normalizePermissions(editingUser.permissions) ?? []);
  });

  const roleNamesToFetch = useMemo(
    () => [Role.USER, ...ASSIGNABLE_COMPANY_ROLES],
    [],
  );

  const { data: rolesData } = useQuery<
    RolesByNamesResponse,
    RolesByNamesVariables
  >(ROLES_BY_NAMES_QUERY, {
    variables: { where: { name: { in: [...roleNamesToFetch] } } },
  });

  const roleIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const role of rolesData?.roles ?? []) {
      map.set(role.name, role.id);
    }
    return map;
  }, [rolesData?.roles]);

  const [createUser, { loading: creating }] = useMutation<
    CreateCompanyManagedUserResponse,
    CreateCompanyManagedUserVariables
  >(CREATE_COMPANY_MANAGED_USER_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Usuario creado" });
      void listRefetch();
      onDone();
    },
    onError: (err) => {
      const msg = err.message ?? "";
      const isEmailTaken =
        msg.includes("Unique constraint failed") &&
        (msg.includes("email") || msg.includes("username"));
      sileo.error({
        title: isEmailTaken ? "Correo ya registrado" : "No se pudo crear",
        description: isEmailTaken
          ? "Usa otro correo o inicia sesión con esa cuenta."
          : msg || "Intenta de nuevo.",
      });
    },
  });

  const [updateUser, { loading: updating }] = useMutation<
    UpdateCompanyManagedUserResponse,
    UpdateCompanyManagedUserVariables
  >(UPDATE_COMPANY_MANAGED_USER_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Cambios guardados" });
      void listRefetch();
      onDone();
    },
    onError: (err) => {
      sileo.error({
        title: "No se pudieron guardar los cambios",
        description: err.message ?? "Intenta de nuevo.",
      });
    },
  });

  const submitting = creating || updating;
  const selectedCount = selectedPermissions.length;
  const allPermsSelected =
    ALL_PERMISSION_KEYS.length > 0 &&
    ALL_PERMISSION_KEYS.every((k) => selectedPermissions.includes(k));

  const toggleRole = (role: AssignableCompanyRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        const next = prev.filter((r) => r !== role);
        return next.length > 0 ? next : prev;
      }
      return [...prev, role];
    });
  };

  const togglePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const toggleModuleAll = (keys: PermissionKey[], checked: boolean) => {
    setSelectedPermissions((prev) => {
      if (checked) {
        const set = new Set(prev);
        for (const key of keys) set.add(key);
        return [...set];
      }
      return prev.filter((key) => !keys.includes(key));
    });
  };

  const resolveRoleConnectIds = (): string[] | null => {
    const userRoleId = roleIdByName.get(Role.USER);
    if (!userRoleId) return null;
    const ids = [userRoleId];
    for (const role of selectedRoles) {
      const id = roleIdByName.get(role);
      if (!id) return null;
      ids.push(id);
    }
    return ids;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (selectedRoles.length === 0) {
      sileo.warning({
        title: "Rol requerido",
        description: "Elige al menos un rol de empresa.",
      });
      return;
    }

    const roleIds = resolveRoleConnectIds();
    if (!roleIds) {
      sileo.error({
        title: "Roles no disponibles",
        description:
          "No se encontraron todos los roles en el sistema. Verifica que Gerencia exista en la plataforma.",
      });
      return;
    }

    try {
      if (isEditMode && editingUser) {
        const data: UpdateCompanyManagedUserVariables["data"] = {
          name: nameTrim,
          lastName: lastNameTrim || null,
          email: emailTrim || null,
          phone: phone.trim() || null,
          birthday: birthday.trim() ? birthday.trim().slice(0, 10) : null,
          permissions: selectedPermissions,
          roles: { set: roleIds.map((id) => ({ id })) },
        };
        if (password) data.password = password;
        await updateUser({
          variables: { where: { id: editingUser.id }, data },
        });
      } else {
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
              permissions: selectedPermissions,
              roles: { connect: roleIds.map((id) => ({ id })) },
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
      className="mx-auto max-w-3xl space-y-4"
      data-tour="usuarios-form"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0] hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400"
            aria-label="Volver a la lista"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9e9e9e]">
              Usuarios
            </p>
            <h3 className="text-xl font-bold text-[#212121] dark:text-white">
              {isEditMode ? "Editar usuario" : "Nuevo usuario"}
            </h3>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm sm:p-5">
        <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
          1. Datos personales
        </h4>
        <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
          Con estos datos inicia sesión en el panel.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClassName}
              required
              autoComplete="family-name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              Correo <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              Contraseña {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
              placeholder={
                isEditMode
                  ? "Dejar en blanco para no cambiar"
                  : "Mínimo 8 caracteres"
              }
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              Confirmar contraseña{" "}
              {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClassName}
              required
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
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
        </div>
      </section>

      <fieldset className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm sm:p-5">
        <legend className="px-1 text-sm font-semibold text-[#212121] dark:text-white">
          2. Roles
        </legend>
        <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
          Puedes combinar roles. Elige al menos uno.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-stretch">
          {ASSIGNABLE_COMPANY_ROLES.map((role) => {
            const checked = selectedRoles.includes(role);
            const helpOpen = openRoleHelp === role;
            return (
              <div
                key={role}
                className={cn(
                  "flex h-full flex-col rounded-xl border px-3 py-3 transition-colors",
                  checked
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-[#e0e0e0] dark:border-[#3a3a3a]",
                  helpOpen && "ring-2 ring-orange-500/30",
                )}
              >
                <div className="flex items-start gap-2">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                      className="size-4 shrink-0 rounded border-[#c0c0c0] text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-semibold text-[#212121] dark:text-white">
                      {ASSIGNABLE_ROLE_LABELS[role]}
                    </span>
                  </label>
                  <button
                    type="button"
                    aria-label={`Qué hace el rol ${ASSIGNABLE_ROLE_LABELS[role]}`}
                    aria-expanded={helpOpen}
                    aria-controls="role-help-panel"
                    onClick={() =>
                      setOpenRoleHelp((cur) => (cur === role ? null : role))
                    }
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                      helpOpen
                        ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        : "text-[#9e9e9e] hover:bg-[#f5f5f5] hover:text-[#212121] dark:hover:bg-[#2a2a2a] dark:hover:text-white",
                    )}
                  >
                    <HugeiconsIcon icon={HelpCircleIcon} size={18} />
                  </button>
                </div>
                <p className="mt-1.5 flex-1 pl-6 text-xs leading-snug text-[#616161] dark:text-[#b0b0b0]">
                  {ROLE_HINTS[role]}
                </p>
              </div>
            );
          })}
        </div>
        {openRoleHelp && (
          <div
            id="role-help-panel"
            role="region"
            aria-live="polite"
            className="mt-3 rounded-xl border border-orange-200/80 bg-[#fffaf5] px-3 py-3 dark:border-orange-900/40 dark:bg-orange-500/[0.07] sm:px-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
                {ASSIGNABLE_ROLE_LABELS[openRoleHelp]}
              </p>
              <button
                type="button"
                onClick={() => setOpenRoleHelp(null)}
                className="inline-flex min-h-9 shrink-0 items-center rounded-lg px-2 text-xs font-medium text-[#616161] hover:bg-black/5 dark:text-[#b0b0b0] dark:hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#424242] dark:text-[#e0e0e0]">
              {ROLE_HELP[openRoleHelp]}
            </p>
          </div>
        )}
      </fieldset>

      <fieldset
        data-tour="usuarios-permissions"
        className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm sm:p-5"
      >
        <legend className="sr-only">Permisos por módulo</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
              3. Permisos por módulo
            </h4>
            <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
              El plan de la suscripción sigue limitando módulos.{" "}
              <span className="font-medium text-[#212121] dark:text-[#e0e0e0]">
                {selectedCount} seleccionados
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSelectedPermissions(
                allPermsSelected ? [] : [...ALL_PERMISSION_KEYS],
              )
            }
            className="inline-flex min-h-9 shrink-0 items-center self-start rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] px-3 text-xs font-medium text-[#212121] dark:text-[#e0e0e0] hover:border-orange-500/50"
          >
            {allPermsSelected ? "Quitar todos" : "Marcar todos"}
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {PERMISSION_MODULES.map((mod) => {
            const keys = mod.permissions.map((p) => p.key);
            const checkedCount = keys.filter((k) =>
              selectedPermissions.includes(k),
            ).length;
            const allChecked = checkedCount === keys.length && keys.length > 0;
            const someChecked = checkedCount > 0 && !allChecked;

            return (
              <div
                key={mod.id}
                className="rounded-xl border border-[#ececec] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#181818] p-3"
              >
                <div className="flex items-center gap-3">
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onChange={(e) =>
                        toggleModuleAll(keys, e.target.checked)
                      }
                      className="size-4 rounded border-[#c0c0c0] text-orange-500 focus:ring-orange-500"
                      aria-label={`Todo el módulo ${mod.label}`}
                    />
                    <span className="text-sm font-semibold text-[#212121] dark:text-white">
                      {mod.label}
                    </span>
                  </label>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium tabular-nums text-[#616161] dark:bg-[#2a2a2a] dark:text-[#9e9e9e]">
                    {checkedCount}/{keys.length}
                  </span>
                </div>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {mod.permissions.map((perm) => {
                    const on = selectedPermissions.includes(perm.key);
                    return (
                      <li key={perm.key}>
                        <label
                          title={perm.description}
                          className={cn(
                            "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            on
                              ? "border-orange-500/60 bg-orange-500/15 text-orange-800 dark:text-orange-200"
                              : "border-[#e0e0e0] bg-white text-[#616161] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#b0b0b0]",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => togglePermission(perm.key)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              on ? "bg-orange-500" : "bg-[#c0c0c0] dark:bg-[#555]",
                            )}
                            aria-hidden
                          />
                          {perm.label}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-2 border-t border-[#e0e0e0]/80 bg-[#f7f7f7]/90 px-1 py-3 backdrop-blur dark:border-[#2e2e2e]/80 dark:bg-[#121212]/90 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 py-2 text-sm font-medium text-[#212121] dark:text-[#e0e0e0] disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting
            ? "Guardando…"
            : isEditMode
              ? "Guardar cambios"
              : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
