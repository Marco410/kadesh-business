"use client";

import { COMPANIES_VISTAS, type CompaniesVista } from "./constants";
import AdminCompaniesPanel from "./AdminCompaniesPanel";
import AdminSyncLogsPanel from "./AdminSyncLogsPanel";
import { AdminSegmented } from "./ui";

/**
 * Empresas (detalle por SaasCompany) y el concentrado global de sync logs.
 * El sync por empresa sigue vivo dentro del detalle; aquí es la vista de todas.
 */
export default function AdminCompaniesSection({
  vista,
  onVistaChange,
}: {
  vista: CompaniesVista;
  onVistaChange: (vista: CompaniesVista) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented
        ariaLabel="Vista de empresas"
        items={[
          { id: COMPANIES_VISTAS.LIST, label: "Empresas" },
          { id: COMPANIES_VISTAS.SYNC_LOGS, label: "Sync" },
        ]}
        value={vista}
        onChange={onVistaChange}
      />
      {vista === COMPANIES_VISTAS.SYNC_LOGS ? (
        <AdminSyncLogsPanel />
      ) : (
        <AdminCompaniesPanel />
      )}
    </div>
  );
}
