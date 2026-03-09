"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft01Icon, Edit02Icon } from "@hugeicons/core-free-icons";

export default function AgregarVendedorSection() {
  const { user } = useUser();
  const userId = user?.id ?? "";

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

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data: vendedoresData } = useQuery<
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

  useEffect(() => {
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
  }, [editingId, vendedores]);

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

  const [createSalesPerson, { loading: creating }] = useMutation<
    CreateSalesPersonResponse,
    CreateSalesPersonVariables
  >(CREATE_SALES_PERSON_MUTATION, {
    refetchQueries: refetchVendedores,
    onCompleted: () => {
      sileo.success({ title: "Vendedor agregado correctamente" });
      setEditingId(null);
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setBirthday("");
      setSalesComission(10);
      setSalesPersonVerified(false);
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
      setEditingId(null);
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setBirthday("");
      setSalesComission(10);
      setSalesPersonVerified(false);
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
    if (!nameTrim || !lastNameTrim || !emailTrim || !phone.trim() || !birthday.trim() || salesComission === 0) {
      sileo.warning({
        title: "Campos requeridos",
        description: "Nombre, apellido paterno, teléfono, fecha de nacimiento, comisión de ventas y correo electrónico son obligatorios.",
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
              birthday: birthday.trim() ? birthday.trim().slice(0, 10) : undefined,
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
      (!creating ||
      !updating)
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`${Routes.profile}?tab=ventas`}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a Ventas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden h-fit">
          <h1 className="px-4 py-3 text-lg font-bold text-[#212121] dark:text-[#ffffff] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            {editingId ? "Editar vendedor" : "Agregar vendedor"}
          </h1>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="agregar-vendedor-name"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del vendedor"
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label
              htmlFor="agregar-vendedor-lastname"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Apellido Paterno <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido paterno"
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="agregar-vendedor-email"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: vendedor@empresa.com"
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
              Se usará para iniciar sesión. Debe ser único en el sistema.
            </p>
          </div>

          <div>
            <label
              htmlFor="agregar-vendedor-password"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingId ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {editingId && (
              <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                Solo escribe una nueva contraseña si quieres cambiarla.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="agregar-vendedor-confirm-password"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="agregar-vendedor-phone"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-phone"
              type="tel"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 55 1234 5678"
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="agregar-vendedor-birthday"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Fecha de nacimiento <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="agregar-vendedor-comission"
              className="block text-sm font-medium text-[#212121] dark:text-[#e0e0e0] mb-1"
            >
              Comisión de ventas (%) <span className="text-red-500">*</span>
            </label>
            <input
              id="agregar-vendedor-comission"
              type="number"
              min={0}
              max={100}
              value={salesComission}
              onChange={(e) =>
                setSalesComission(
                  Math.min(100, Math.max(0, Number(e.target.value) || 0))
                )
              }
              className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm text-[#212121] dark:text-[#ffffff] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="agregar-vendedor-verified"
              type="checkbox"
              checked={salesPersonVerified}
              onChange={(e) => setSalesPersonVerified(e.target.checked)}
              className="rounded border-[#e0e0e0] dark:border-[#3a3a3a] text-orange-500 focus:ring-orange-500"
            />
            <label
              htmlFor="agregar-vendedor-verified"
              className="text-sm font-medium text-[#212121] dark:text-[#e0e0e0]"
            >
              Vendedor verificado
            </label>
          </div>

          {!companyId && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Tu usuario no tiene empresa asignada. No podrás agregar vendedores hasta tener una.
            </p>
          )}

          <div className="pt-2 flex flex-wrap gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setLastName("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setPhone("");
                  setBirthday("");
                  setSalesComission(10);
                  setSalesPersonVerified(false);
                }}
                className="inline-flex justify-center px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#e0e0e0] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e]"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full sm:w-auto inline-flex justify-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating
                ? "Agregando…"
                : updating
                  ? "Guardando…"
                  : editingId
                    ? "Guardar cambios"
                    : "Agregar vendedor"}
            </button>
          </div>
        </form>
        </div>

        {/* Lista de vendedores */}
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
          <h2 className="px-4 py-3 text-lg font-bold text-[#212121] dark:text-[#ffffff] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            Vendedores ({vendedores.length})
          </h2>
          <div className="p-4">
            {!companyId ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Sin empresa asignada. No se pueden listar vendedores.
              </p>
            ) : vendedores.length === 0 ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Aún no hay vendedores. Agrega uno con el formulario.
              </p>
            ) : (
              <ul className="space-y-3">
                {vendedores.map((v) => (
                  <li
                    key={v.id}
                    className={`flex flex-wrap items-center justify-between gap-2 py-3 px-3 rounded-lg border ${
                      editingId === v.id
                        ? "border-orange-500 dark:border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                        : "border-[#e8e8e8] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#212121] dark:text-[#ffffff] truncate">
                        {[v.name, v.lastName].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] truncate">
                        {v.email || "Sin correo"}
                      </p>
                      {v.phone && (
                        <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                          {v.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      {user?.id === v.id && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded"
                          title="Este eres tú"
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 dark:bg-orange-500" aria-hidden="true" />
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.salesComission != null && (
                        <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0] bg-[#eee] dark:bg-[#333] px-2 py-1 rounded">
                          {v.salesComission}%
                        </span>
                      )}
                      {v.salesPersonVerified ? (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                          Verificado
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                          No verificado
                        </span>
                      )}
                      

                      <button
                        type="button"
                        onClick={() => setEditingId(v.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:bg-[#eee] dark:hover:bg-[#333] hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        title="Editar"
                      >
                        <HugeiconsIcon icon={Edit02Icon} size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
