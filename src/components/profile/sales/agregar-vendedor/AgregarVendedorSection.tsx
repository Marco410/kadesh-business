"use client";

import { useMemo, useRef, useState } from "react";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  ROLES_BY_NAMES_QUERY,
  CREATE_SALES_PERSON_MUTATION,
  COMPANY_VENDEDORES_QUERY,
  UPDATE_VENDEDOR_MUTATION,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
  type RolesByNamesResponse,
  type RolesByNamesVariables,
  type CreateSalesPersonVariables,
  type CreateSalesPersonResponse,
  type CompanyVendedoresResponse,
  type CompanyVendedoresVariables,
  type UpdateVendedorVariables,
  type UpdateVendedorResponse,
} from "kadesh/components/profile/sales/queries";
import { Role } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Edit02Icon,
  Search01Icon,
  UserAdd02Icon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  Mail01Icon,
  CallIcon,
} from "@hugeicons/core-free-icons";
import { canManageCompanyUsers } from "kadesh/utils/user-roles";
import { can } from "kadesh/components/profile/usuarios/can";
import { PERMISSION_KEYS } from "kadesh/components/profile/usuarios/permissions";
import RoleAccessDeniedSection from "../RoleAccessDeniedSection";

const fieldClass =
  "w-full min-h-11 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

const labelClass =
  "block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1.5";

function initials(name: string, lastName: string | null | undefined): string {
  const a = name.trim().charAt(0);
  const b = (lastName ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function emptyForm() {
  return {
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthday: "",
    salesComission: 10,
    salesPersonVerified: false,
  };
}

export default function AgregarVendedorSection() {
  const { user, loading: userLoading } = useUser();
  const userId = user?.id ?? "";
  const formRef = useRef<HTMLFormElement>(null);

  const canCreateVendedores = can(
    user,
    PERMISSION_KEYS.VENDEDORES_CREAR,
    () => canManageCompanyUsers(user),
  );
  const canEditVendedores = can(
    user,
    PERMISSION_KEYS.VENDEDORES_EDITAR,
    () => canManageCompanyUsers(user),
  );
  const canManageVendedores = canCreateVendedores || canEditVendedores;

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [salesComission, setSalesComission] = useState<number>(10);
  const [salesPersonVerified, setSalesPersonVerified] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;
  const companyName = userData?.user?.company?.name ?? null;

  const { data: vendedoresData, loading: listLoading } = useQuery<
    CompanyVendedoresResponse,
    CompanyVendedoresVariables
  >(COMPANY_VENDEDORES_QUERY, {
    variables: {
      where: {
        company: companyId ? { id: { equals: companyId } } : undefined,
        roles: { some: { name: { equals: Role.VENDEDOR } } },
      },
    },
    skip: !companyId,
  });

  const vendedores = vendedoresData?.users ?? [];
  const vendedoresKey = vendedores
    .map((u) =>
      [
        u.id,
        u.name ?? "",
        u.lastName ?? "",
        u.email ?? "",
        u.phone ?? "",
        u.birthday ?? "",
        u.salesComission ?? "",
        u.salesPersonVerified ?? "",
      ].join("\u0001"),
    )
    .join("\u0002");

  useApplyOnKeyChange([editingId ?? "", vendedoresKey].join("\0"), () => {
    if (!editingId || vendedores.length === 0) return;
    const v = vendedores.find((u) => u.id === editingId);
    if (!v) return;
    setName(v.name ?? "");
    setLastName(v.lastName ?? "");
    setEmail(v.email ?? "");
    setPhone(v.phone ?? "");
    setBirthday(v.birthday ? v.birthday.slice(0, 10) : "");
    setSalesComission(v.salesComission ?? 10);
    setSalesPersonVerified(v.salesPersonVerified ?? false);
    setPassword("");
    setConfirmPassword("");
  });

  const { data: rolesData } = useQuery<
    RolesByNamesResponse,
    RolesByNamesVariables
  >(ROLES_BY_NAMES_QUERY, {
    variables: {
      where: { name: { in: [Role.USER, Role.VENDEDOR] } },
    },
    skip: !userId,
  });

  const refetchVendedores =
    companyId != null
      ? [
          {
            query: COMPANY_VENDEDORES_QUERY,
            variables: {
              where: {
                company: { id: { equals: companyId } },
                roles: { some: { name: { equals: Role.VENDEDOR } } },
              },
            },
          },
        ]
      : [];

  const resetForm = () => {
    const empty = emptyForm();
    setEditingId(null);
    setName(empty.name);
    setLastName(empty.lastName);
    setEmail(empty.email);
    setPassword(empty.password);
    setConfirmPassword(empty.confirmPassword);
    setPhone(empty.phone);
    setBirthday(empty.birthday);
    setSalesComission(empty.salesComission);
    setSalesPersonVerified(empty.salesPersonVerified);
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const [createSalesPerson, { loading: creating }] = useMutation<
    CreateSalesPersonResponse,
    CreateSalesPersonVariables
  >(CREATE_SALES_PERSON_MUTATION, {
    refetchQueries: refetchVendedores,
    onCompleted: () => {
      sileo.success({ title: "Vendedor agregado correctamente" });
      resetForm();
    },
    onError: (err) => {
      const msg = err.message ?? "";
      const isEmailTaken =
        msg.includes("Unique constraint failed") &&
        (msg.includes("email") || msg.includes("username"));
      if (isEmailTaken) {
        sileo.error({
          title: "Correo ya registrado",
          description:
            "Ese correo electrónico ya está en uso. Usa otro o inicia sesión con esa cuenta.",
        });
      } else {
        sileo.error({
          title: "No se pudo agregar el vendedor",
          description: msg || "Intenta de nuevo más tarde.",
        });
      }
    },
  });

  const [updateVendedor, { loading: updating }] = useMutation<
    UpdateVendedorResponse,
    UpdateVendedorVariables
  >(UPDATE_VENDEDOR_MUTATION, {
    refetchQueries: refetchVendedores,
    onCompleted: () => {
      sileo.success({ title: "Cambios guardados" });
      resetForm();
    },
    onError: (err) => {
      const msg = err.message ?? "";
      const isEmailTaken =
        msg.includes("Unique constraint failed") &&
        (msg.includes("email") || msg.includes("username"));
      if (isEmailTaken) {
        sileo.error({
          title: "Correo ya registrado",
          description: "Ese correo ya está en uso. Elige otro.",
        });
      } else {
        sileo.error({
          title: "No se pudieron guardar los cambios",
          description: msg || "Intenta de nuevo.",
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId ? !canEditVendedores : !canCreateVendedores) {
      sileo.error({
        title: "Sin permiso",
        description: editingId
          ? "No tienes permiso para editar vendedores."
          : "No tienes permiso para agregar vendedores.",
      });
      return;
    }
    if (!companyId) {
      sileo.error({
        title: "Sin empresa",
        description: "Tu usuario no tiene una empresa asignada.",
      });
      return;
    }
    const roleIds = rolesData?.roles?.map((r) => ({ id: r.id })) ?? [];
    if (roleIds.length === 0) {
      sileo.error({
        title: "Roles no disponibles",
        description: "No se encontraron los roles de vendedor y usuario.",
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
      !birthday.trim() ||
      salesComission === 0
    ) {
      sileo.warning({
        title: "Campos requeridos",
        description:
          "Nombre, apellido paterno, teléfono, fecha de nacimiento, comisión de ventas y correo electrónico son obligatorios.",
      });
      return;
    }
    if (!editingId && !password) {
      sileo.warning({
        title: "Contraseña requerida",
        description: "Define una contraseña para que el vendedor pueda entrar.",
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
    try {
      if (editingId) {
        const updateData: UpdateVendedorVariables["data"] = {
          name: nameTrim,
          lastName: lastNameTrim || null,
          email: emailTrim || null,
          phone: phone.trim() || null,
          birthday: birthday.trim() ? birthday.trim().slice(0, 10) : null,
          salesComission: salesComission ?? null,
          salesPersonVerified,
        };
        if (password) updateData.password = password;
        await updateVendedor({
          variables: { where: { id: editingId }, data: updateData },
        });
      } else {
        await createSalesPerson({
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
              salesComission: salesComission ?? undefined,
              salesPersonVerified,
              roles: { connect: roleIds },
              company: { connect: { id: companyId } },
            },
          },
        });
      }
    } catch {
      // onError already shows toast
    }
  };

  const isEditMode = Boolean(editingId);
  const passwordOk = isEditMode
    ? !password || password === confirmPassword
    : Boolean(password && password === confirmPassword);
  const canSubmit = Boolean(
    userId &&
      companyId &&
      name.trim() &&
      lastName.trim() &&
      email.trim() &&
      phone.trim() &&
      birthday.trim() &&
      salesComission > 0 &&
      passwordOk &&
      !(creating || updating) &&
      (isEditMode ? canEditVendedores : canCreateVendedores),
  );

  const filteredVendedores = useMemo(() => {
    const q = normalizeSearch(listSearch.trim());
    if (!q) return vendedores;
    return vendedores.filter((v) => {
      const hay = normalizeSearch(
        [v.name, v.lastName, v.email, v.phone].filter(Boolean).join(" "),
      );
      return hay.includes(q);
    });
  }, [listSearch, vendedores]);

  const editingName = useMemo(() => {
    if (!editingId) return null;
    const v = vendedores.find((u) => u.id === editingId);
    if (!v) return null;
    return [v.name, v.lastName].filter(Boolean).join(" ");
  }, [editingId, vendedores]);

  if (userLoading) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-20">
        <span
          className="size-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (!canManageVendedores) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <RoleAccessDeniedSection
          title="No tienes acceso a gestionar vendedores"
          description="Necesitas el permiso de altas o edición de vendedores. Tener también el rol de vendedor no bloquea el acceso."
          backHref={`${Routes.panel}?tab=vendedores`}
          backLabel="Volver a Vendedores"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 space-y-3">
        <Link
          href={`${Routes.panel}?tab=vendedores`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[#616161] transition-colors hover:text-orange-500 dark:text-[#b0b0b0] dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a Vendedores
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#212121] dark:text-white">
              Gestionar vendedores
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#616161] dark:text-[#b0b0b0]">
              Alta y edición de cuentas del equipo comercial
              {companyName ? ` de ${companyName}` : ""}. El correo será su
              acceso al panel.
            </p>
          </div>
          <p className="text-sm tabular-nums text-[#9e9e9e] dark:text-[#888]">
            {vendedores.length}{" "}
            {vendedores.length === 1 ? "vendedor" : "vendedores"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
        {/* Formulario */}
        <div className="order-1 lg:col-span-3 lg:order-1">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-500/[0.07] via-white to-emerald-500/[0.04] shadow-sm dark:border-orange-900/40 dark:from-orange-500/10 dark:via-[#1e1e1e] dark:to-emerald-500/[0.06]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-orange-200/50 px-4 py-4 dark:border-orange-900/30 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/80 dark:text-orange-300/80">
                  {isEditMode ? "Editando" : "Nueva alta"}
                </p>
                <h2 className="mt-0.5 truncate text-lg font-bold text-[#212121] dark:text-white">
                  {isEditMode
                    ? editingName || "Editar vendedor"
                    : "Agregar vendedor"}
                </h2>
                {isEditMode && (
                  <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Los cambios se aplican al guardar. La contraseña solo cambia
                    si escribes una nueva.
                  </p>
                )}
              </div>
              {isEditMode ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[#e0e0e0] bg-white px-3 text-sm font-medium text-[#616161] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#b0b0b0] dark:hover:bg-[#333]"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  Cancelar
                </button>
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-300">
                  <HugeiconsIcon icon={UserAdd02Icon} size={20} />
                </span>
              )}
            </div>

            {!canCreateVendedores && !isEditMode ? (
              <div className="px-4 py-8 text-center sm:px-5">
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Puedes editar vendedores desde la lista
                  {canEditVendedores ? " a la derecha" : ""}. No tienes permiso
                  para crear altas nuevas.
                </p>
              </div>
            ) : (
              <div className="space-y-6 px-4 py-5 sm:px-5">
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                    Identidad
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="agregar-vendedor-name" className={labelClass}>
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="agregar-vendedor-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre"
                        autoComplete="given-name"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="agregar-vendedor-lastname"
                        className={labelClass}
                      >
                        Apellido paterno <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="agregar-vendedor-lastname"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Apellido paterno"
                        autoComplete="family-name"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="agregar-vendedor-phone"
                        className={labelClass}
                      >
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="agregar-vendedor-phone"
                        type="tel"
                        value={phone}
                        maxLength={10}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        placeholder="5512345678"
                        autoComplete="tel"
                        inputMode="numeric"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="agregar-vendedor-birthday"
                        className={labelClass}
                      >
                        Fecha de nacimiento{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="agregar-vendedor-birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                    Acceso al panel
                  </h3>
                  <div>
                    <label
                      htmlFor="agregar-vendedor-email"
                      className={labelClass}
                    >
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="agregar-vendedor-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vendedor@empresa.com"
                      autoComplete="email"
                      className={fieldClass}
                    />
                    <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                      Con este correo inicia sesión. Debe ser único.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="agregar-vendedor-password"
                        className={labelClass}
                      >
                        Contraseña{" "}
                        {!isEditMode && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        id="agregar-vendedor-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          isEditMode
                            ? "Dejar en blanco para no cambiar"
                            : "Mínimo 8 caracteres"
                        }
                        autoComplete={
                          isEditMode ? "new-password" : "new-password"
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="agregar-vendedor-confirm-password"
                        className={labelClass}
                      >
                        Confirmar contraseña{" "}
                        {(!isEditMode || password.length > 0) && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        id="agregar-vendedor-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        autoComplete="new-password"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                  {password.length > 0 &&
                    confirmPassword.length > 0 &&
                    password !== confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Las contraseñas no coinciden.
                      </p>
                    )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                    Comercial
                  </h3>
                  <div>
                    <label
                      htmlFor="agregar-vendedor-comission"
                      className={labelClass}
                    >
                      Comisión de ventas (%){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="agregar-vendedor-comission"
                      type="number"
                      min={0}
                      max={100}
                      value={salesComission}
                      onChange={(e) =>
                        setSalesComission(
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0),
                          ),
                        )
                      }
                      className={`${fieldClass} max-w-[10rem]`}
                    />
                  </div>
                  <label
                    htmlFor="agregar-vendedor-verified"
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#e0e0e0] bg-white/80 px-3 py-2.5 dark:border-[#3a3a3a] dark:bg-[#2a2a2a]/80"
                  >
                    <input
                      id="agregar-vendedor-verified"
                      type="checkbox"
                      checked={salesPersonVerified}
                      onChange={(e) =>
                        setSalesPersonVerified(e.target.checked)
                      }
                      className="size-4 rounded border-[#e0e0e0] text-orange-500 focus:ring-orange-500 dark:border-[#3a3a3a]"
                    />
                    <span className="text-sm font-medium text-[#212121] dark:text-[#e0e0e0]">
                      Marcar como vendedor verificado
                    </span>
                  </label>
                </section>

                {!companyId && (
                  <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    Tu usuario no tiene empresa asignada. No podrás guardar
                    hasta tener una.
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-[#e8e8e8] pt-4 dark:border-[#333] sm:flex-row sm:justify-end">
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e0e0e0] bg-white px-4 text-sm font-medium text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#e0e0e0] dark:hover:bg-[#333]"
                    >
                      Cancelar edición
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating
                      ? "Agregando…"
                      : updating
                        ? "Guardando…"
                        : isEditMode
                          ? "Guardar cambios"
                          : "Agregar vendedor"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Lista */}
        <aside className="order-2 lg:col-span-2 lg:order-2 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
            <div className="border-b border-[#e0e0e0] px-4 py-3 dark:border-[#3a3a3a]">
              <h2 className="text-base font-bold text-[#212121] dark:text-white">
                Equipo actual
              </h2>
              <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                Toca editar para cargar sus datos en el formulario.
              </p>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]">
                  <HugeiconsIcon icon={Search01Icon} size={16} />
                </span>
                <input
                  type="search"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Buscar por nombre o correo…"
                  aria-label="Buscar vendedores"
                  className={`${fieldClass} pl-9`}
                />
              </div>
            </div>

            <div className="max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain p-3">
              {!companyId ? (
                <p className="px-2 py-6 text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Sin empresa asignada. No se pueden listar vendedores.
                </p>
              ) : listLoading ? (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl bg-[#f0f0f0] dark:bg-[#2a2a2a]"
                    />
                  ))}
                </div>
              ) : vendedores.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e0e0e0] px-4 py-8 text-center dark:border-[#3a3a3a]">
                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                    Aún no hay vendedores
                  </p>
                  <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Completa el formulario para dar de alta al primero.
                  </p>
                </div>
              ) : filteredVendedores.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Nadie coincide con “{listSearch.trim()}”.
                </p>
              ) : (
                <ul className="space-y-2">
                  {filteredVendedores.map((v) => {
                    const fullName =
                      [v.name, v.lastName].filter(Boolean).join(" ") || "—";
                    const selected = editingId === v.id;
                    return (
                      <li
                        key={v.id}
                        className={`rounded-xl border p-3 transition-colors ${
                          selected
                            ? "border-orange-500 bg-orange-500/[0.06] dark:bg-orange-500/10"
                            : "border-[#e8e8e8] bg-[#fafafa] dark:border-[#333] dark:bg-[#252525]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                            {initials(v.name ?? "", v.lastName)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                                {fullName}
                              </p>
                              {user?.id === v.id && (
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                  Tú
                                </span>
                              )}
                              {v.salesPersonVerified && (
                                <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400">
                                  <HugeiconsIcon
                                    icon={CheckmarkBadge01Icon}
                                    size={14}
                                  />
                                </span>
                              )}
                            </div>
                            {v.email && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                                <HugeiconsIcon icon={Mail01Icon} size={12} />
                                {v.email}
                              </p>
                            )}
                            {v.phone && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                                <HugeiconsIcon icon={CallIcon} size={12} />
                                {v.phone}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {v.salesComission != null && (
                                <span className="rounded-md bg-[#eee] px-2 py-0.5 text-xs font-medium text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]">
                                  {v.salesComission}% comisión
                                </span>
                              )}
                              {canEditVendedores && (
                                <button
                                  type="button"
                                  onClick={() => startEdit(v.id)}
                                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-500/10 dark:text-orange-400"
                                >
                                  <HugeiconsIcon icon={Edit02Icon} size={14} />
                                  {selected ? "Editando" : "Editar"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
