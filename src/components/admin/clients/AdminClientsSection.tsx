"use client";

import {
  CLIENTS_VISTAS,
  parseClientsVista,
  type ClientsVista,
} from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { AdminSegmented } from "../ui";
import AdminCompaniesList from "./AdminCompaniesList";
import AdminPeopleList from "./AdminPeopleList";
import AdminCompany360 from "./company/AdminCompany360";
import AdminPerson360 from "./person/AdminPerson360";

/**
 * Clientes = lo que antes eran Usuarios (Cuentas / Suscripciones) y Empresas (Empresas / Sync).
 * Lista de empresas o de personas; con `empresa` abre el 360 y con `usuario` la ficha de
 * alguien sin empresa.
 */
export default function AdminClientsSection() {
  const { searchParams, setParams } = useAdminNavigation();
  const companyId = searchParams.get("empresa");
  const userId = searchParams.get("usuario");
  const vista = parseClientsVista(searchParams.get("vista"));

  if (companyId) return <AdminCompany360 key={companyId} companyId={companyId} />;
  if (userId) return <AdminPerson360 key={userId} userId={userId} />;

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented<ClientsVista>
        ariaLabel="Vista de clientes"
        items={[
          { id: CLIENTS_VISTAS.COMPANIES, label: "Empresas" },
          { id: CLIENTS_VISTAS.PEOPLE, label: "Personas" },
        ]}
        value={vista}
        onChange={(next) =>
          setParams({
            vista: next === CLIENTS_VISTAS.PEOPLE ? next : null,
            q: null,
            pagina: null,
            estado: null,
            orden: null,
            rol: null,
            conEmpresa: null,
          })
        }
      />
      {vista === CLIENTS_VISTAS.PEOPLE ? (
        <AdminPeopleList key="personas" />
      ) : (
        <AdminCompaniesList key="empresas" />
      )}
    </div>
  );
}
