"use client";

import {
  ANALYTICS_VISTA_ITEMS,
  ANALYTICS_VISTAS,
  parseAnalyticsVista,
  type AnalyticsVista,
} from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { AdminSegmented } from "../ui";
import AcquisitionPanel from "./AcquisitionPanel";
import ActivationPanel from "./ActivationPanel";
import DemandPanel from "./DemandPanel";
import EngagementPanel from "./EngagementPanel";
import HealthPanel from "./HealthPanel";
import RetentionPanel from "./RetentionPanel";

/** Filtros propios de cada vista: se limpian al cambiar de vista. */
const VIEW_PARAMS = ["nivel", "senal", "dias", "meses", "umbral", "q", "pagina", "orden", "cuentas"];

/** Métricas para operar el negocio: salud de cada cuenta, activación, retención, uso, demanda y adquisición. */
export default function AdminAnalyticsSection() {
  const { searchParams, setParams } = useAdminNavigation();
  const vista = parseAnalyticsVista(searchParams.get("vista"));

  const changeVista = (next: AnalyticsVista) =>
    setParams({
      vista: next === ANALYTICS_VISTAS.HEALTH ? null : next,
      ...Object.fromEntries(VIEW_PARAMS.map((key) => [key, null])),
    });

  return (
    <div className="flex flex-col gap-4" data-tour="admin-analitica">
      <AdminSegmented
        ariaLabel="Vistas de analítica"
        items={ANALYTICS_VISTA_ITEMS}
        value={vista}
        onChange={changeVista}
      />
      {vista === ANALYTICS_VISTAS.HEALTH ? <HealthPanel /> : null}
      {vista === ANALYTICS_VISTAS.ACTIVATION ? <ActivationPanel /> : null}
      {vista === ANALYTICS_VISTAS.RETENTION ? <RetentionPanel /> : null}
      {vista === ANALYTICS_VISTAS.ENGAGEMENT ? <EngagementPanel /> : null}
      {vista === ANALYTICS_VISTAS.DEMAND ? <DemandPanel /> : null}
      {vista === ANALYTICS_VISTAS.ACQUISITION ? <AcquisitionPanel /> : null}
    </div>
  );
}
