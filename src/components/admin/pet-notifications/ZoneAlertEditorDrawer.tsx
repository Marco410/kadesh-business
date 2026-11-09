"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_TABS } from "../constants";
import {
  AdminButton,
  AdminDefinitionList,
  AdminDrawer,
  AdminStatusBadge,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  formatPersonName,
} from "../ui";
import {
  ADMIN_UPDATE_ZONE_ALERTS_MUTATION,
  type AdminUpdateZoneAlertsResponse,
  type AdminZoneAlertRow,
} from "./queries";
import { ZONE_WHATSAPP, formatPoint, mapsUrl, parseLatLng } from "./constants";
import { adminErrorText } from "../errors";

/**
 * Administrar las alertas de zona de una persona: encenderlas o apagarlas, mover el centro de su
 * zona, cambiar el radio y apagarle el WhatsApp. Encender su WhatsApp no se puede desde aquí: a un
 * usuario Meta le pide que lo acepte él mismo (en /notificaciones de Kadesh Pet).
 */
export default function ZoneAlertEditorDrawer({
  row,
  onClose,
  onSaved,
}: {
  row: AdminZoneAlertRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const name = row ? formatPersonName(row.name, row.lastName) : "";
  return (
    <AdminDrawer
      open={Boolean(row)}
      onClose={onClose}
      ariaLabel={`Alertas de zona de ${name}`}
      title={name}
      subtitle={row ? [row.email, row.phone].filter(Boolean).join(" · ") : undefined}
    >
      {row ? (
        // La key vuelve a montar el formulario con los datos nuevos al guardar o cambiar de persona.
        <ZoneAlertForm
          key={`${row.id}|${row.lat}|${row.lng}|${row.radiusKm}|${row.enabled}|${row.whatsapp}`}
          row={row}
          name={name}
          onSaved={onSaved}
        />
      ) : null}
    </AdminDrawer>
  );
}

function ZoneAlertForm({ row, name, onSaved }: { row: AdminZoneAlertRow; name: string; onSaved: () => void }) {
  const [point, setPoint] = useState(() => formatPoint(row.lat, row.lng));
  const [radius, setRadius] = useState(row.radiusKm ?? 5);
  const [update, { loading }] = useMutation<AdminUpdateZoneAlertsResponse>(ADMIN_UPDATE_ZONE_ALERTS_MUTATION);

  const parsed = parseLatLng(point);
  const pointChanged = parsed !== null && formatPoint(parsed.lat, parsed.lng) !== formatPoint(row.lat, row.lng);
  const radiusChanged = radius !== (row.radiusKm ?? 5);
  const whatsapp = ZONE_WHATSAPP[row.whatsapp];

  const save = async (extra: { enabled?: boolean; disableWhatsapp?: boolean } = {}) => {
    try {
      const { data } = await update({
        variables: {
          userId: row.id,
          ...(pointChanged && parsed ? { lat: parsed.lat, lng: parsed.lng } : {}),
          ...(radiusChanged ? { radiusKm: radius } : {}),
          ...extra,
        },
      });
      const outcome = data?.adminUpdateZoneAlerts;
      if (outcome?.success) {
        sileo.success({ title: outcome.message });
        onSaved();
      } else {
        sileo.error({ title: "No se guardó", description: outcome?.message });
      }
    } catch (err) {
      sileo.error({ title: "No se guardó", description: adminErrorText(err, "Intenta de nuevo.") });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusBadge label={row.enabled ? "Alertas activas" : "Alertas apagadas"} tone={row.enabled ? "ok" : "neutral"} />
        <AdminStatusBadge label={row.pushDevices ? `App: ${row.pushDevices} disp.` : "Sin app"} tone={row.pushDevices ? "ok" : "neutral"} />
        <AdminStatusBadge label={whatsapp.label} tone={whatsapp.tone} />
      </div>

      <AdminDefinitionList
        columns={2}
        items={[
          { label: "Alertas recibidas (30 días)", value: row.alerts30d.toLocaleString("es-MX") },
          { label: "Última alerta", value: row.lastAlertAt ? formatDateShort(row.lastAlertAt) : "Ninguna" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="zone-point" className={adminLabelClass}>
            Centro de la zona
          </label>
          <input
            id="zone-point"
            value={point}
            onChange={(e) => setPoint(e.target.value)}
            placeholder="19.7027, -101.1923 o un enlace de Google Maps"
            className={adminInputClass}
          />
          <p className="mt-1.5 text-xs text-dash-muted">
            {point && !parsed ? (
              <span className="text-red-700 dark:text-red-400">No reconocemos ese punto. Usa «latitud, longitud».</span>
            ) : parsed ? (
              <a href={mapsUrl(parsed.lat, parsed.lng)} target="_blank" rel="noopener noreferrer" className="underline">
                Ver en Google Maps
              </a>
            ) : (
              "Sin zona: no puede recibir alertas."
            )}
          </p>
        </div>
        <div>
          <label htmlFor="zone-radius" className={adminLabelClass}>
            Radio: {radius} km
          </label>
          <input
            id="zone-radius"
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
        <AdminButton
          onClick={() => void save()}
          disabled={loading || (!pointChanged && !radiusChanged) || (Boolean(point) && !parsed)}
        >
          Guardar zona
        </AdminButton>
      </div>

      <div className="flex flex-col gap-2 border-t border-dash-line pt-5">
        <AdminButton
          variant={row.enabled ? "danger-ghost" : "outline"}
          onClick={() => void save({ enabled: !row.enabled })}
          disabled={loading || (!row.enabled && !parsed)}
        >
          {row.enabled ? "Apagar sus alertas de zona" : "Encender sus alertas de zona"}
        </AdminButton>
        {row.whatsapp !== "off" ? (
          <AdminButton
            variant="danger-ghost"
            onClick={() => {
              if (window.confirm(`¿Apagar todos los avisos por WhatsApp de ${name}? Solo esa persona puede volver a encenderlos.`)) {
                void save({ disableWhatsapp: true });
              }
            }}
            disabled={loading}
          >
            Apagar su WhatsApp
          </AdminButton>
        ) : (
          <p className="text-xs text-dash-muted">
            No recibe avisos por WhatsApp. Solo esa persona puede activarlos (Meta exige que acepte).
          </p>
        )}
        <Link
          href={Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "avisos", persona: row.email || row.name })}
          className={adminButtonClass({ variant: "ghost", size: "sm" })}
        >
          Ver los avisos que recibió
        </Link>
      </div>
    </div>
  );
}
