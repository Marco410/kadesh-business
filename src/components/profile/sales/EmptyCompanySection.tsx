"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  ROLES_BY_NAMES_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type RolesByNamesResponse,
  type RolesByNamesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  CREATE_SAAS_COMPANY_MUTATION,
  UPDATE_USER_MUTATION,
  type CreateSaasCompanyVariables,
  type CreateSaasCompanyResponse,
  type UpdateUserVariables,
  type UpdateUserResponse,
} from "kadesh/utils/queries";
import { Role } from "kadesh/constants/constans";
import { sileo } from "sileo";

interface EmptyCompanySectionProps {
  userId: string;
  onSuccess: () => Promise<void>;
}

export default function EmptyCompanySection({ userId, onSuccess }: EmptyCompanySectionProps) {
  const [companyName, setCompanyName] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [createCompanyError, setCreateCompanyError] = useState("");

  const { data: rolesData } = useQuery<
    RolesByNamesResponse,
    RolesByNamesVariables
  >(ROLES_BY_NAMES_QUERY, {
    variables: { where: { name: { in: [Role.VENDEDOR, Role.ADMIN_COMPANY] } } },
  });

  const vendedorRoleId = rolesData?.roles?.find((r) => r.name === Role.VENDEDOR)?.id;
  const adminCompanyRoleId = rolesData?.roles?.find((r) => r.name === Role.ADMIN_COMPANY)?.id;

  const [createSaasCompany] = useMutation<
    CreateSaasCompanyResponse,
    CreateSaasCompanyVariables
  >(CREATE_SAAS_COMPANY_MUTATION);

  const [updateUser] = useMutation<UpdateUserResponse, UpdateUserVariables>(
    UPDATE_USER_MUTATION,
    {
      refetchQueries: [
        { query: USER_COMPANY_CATEGORIES_QUERY, variables: { where: { id: userId } } },
      ],
    }
  );

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCompanyError("");
    const name = companyName.trim();
    if (!name) {
      setCreateCompanyError("Escribe el nombre de tu negocio.");
      return;
    }
    const roleIds = [vendedorRoleId, adminCompanyRoleId].filter(
      (id): id is string => Boolean(id)
    );
    if (roleIds.length === 0) {
      setCreateCompanyError("No se pudieron cargar los roles. Recarga la página.");
      return;
    }
    setCreatingCompany(true);
    try {
      const { data: companyData } = await createSaasCompany({
        variables: { data: { name } },
      });
      const newCompanyId = companyData?.createSaasCompany?.id;
      if (!newCompanyId) {
        setCreateCompanyError("No se pudo crear la empresa. Intenta de nuevo.");
        setCreatingCompany(false);
        return;
      }
      await updateUser({
        variables: {
          where: { id: userId },
          data: {
            company: { connect: { id: newCompanyId } },
            roles: { connect: roleIds.map((id) => ({ id })) },
          },
        },
      });
      await onSuccess();
      sileo.success({ title: "Negocio creado correctamente" });
      setCompanyName("");
    } catch (err) {
      setCreateCompanyError(
        err instanceof Error ? err.message : "Error al crear el negocio. Intenta de nuevo."
      );
    } finally {
      setCreatingCompany(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm max-w-lg">
        <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
          Crea tu negocio
        </h2>
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-6">
          Asocia un negocio a tu cuenta para empezar a obtener clientes y gestionar ventas.
        </p>
        <form onSubmit={handleCreateCompany} className="space-y-4">
          {createCompanyError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {createCompanyError}
            </div>
          )}
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-1.5"
            >
              Nombre de negocio <span className="text-red-500">*</span>
            </label>
            <input
              id="company-name"
              type="text"
              placeholder="Mi Empresa S.A. de C.V."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={creatingCompany}
              className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={creatingCompany}
            className="w-full px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creatingCompany ? (
              <>
                <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creando...
              </>
            ) : (
              "Crear negocio y continuar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
