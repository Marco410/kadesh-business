"use client";

import { USERS_VISTAS, type UsersVista } from "./constants";
import AdminSubscriptionsPanel from "./AdminSubscriptionsPanel";
import AdminUsersPanel from "./AdminUsersPanel";
import { AdminSegmented } from "./ui";

/**
 * Cuentas y suscripciones viven juntas: la suscripción es de la empresa de
 * esos usuarios, no un catálogo aparte. El catálogo está en la tab Planes.
 */
export default function AdminUsersSection({
  vista,
  onVistaChange,
}: {
  vista: UsersVista;
  onVistaChange: (vista: UsersVista) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented
        ariaLabel="Vista de usuarios"
        items={[
          { id: USERS_VISTAS.ACCOUNTS, label: "Cuentas" },
          { id: USERS_VISTAS.SUBSCRIPTIONS, label: "Suscripciones" },
        ]}
        value={vista}
        onChange={onVistaChange}
      />
      {vista === USERS_VISTAS.SUBSCRIPTIONS ? (
        <AdminSubscriptionsPanel />
      ) : (
        <AdminUsersPanel />
      )}
    </div>
  );
}
