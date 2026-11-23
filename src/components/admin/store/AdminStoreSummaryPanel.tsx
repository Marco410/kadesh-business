"use client";

import { useQuery } from "@apollo/client";
import { ColumnBars, HBarList } from "kadesh/components/app-shell";
import { formatDateShort } from "kadesh/utils/format-date";
import ViewGuide from "../analytics/ViewGuide";
import { adminErrorText } from "../errors";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatTile,
} from "../ui";
import {
  STORE_PAYMENT_METHOD_LABELS,
  STORE_SECTIONS,
  STORE_SOURCE_LABELS,
  STORE_SUMMARY_DAY_OPTIONS,
  STORE_SUMMARY_DEFAULT_DAYS,
  formatCents,
  storeSummaryDelta,
} from "./constants";
import { ADMIN_STORE_SUMMARY_QUERY, type AdminStoreSummaryResponse } from "./summary-queries";

const HELP = {
  revenue: "Lo que pagaron quienes compraron: productos, menos cupones, más el envío que se les cobró. Solo pedidos pagados que no se han reembolsado, en el día en que se pagaron.",
  margin: "Ventas menos el costo de los productos y lo que costó enviar cada paquete. No descuenta la comisión de Stripe. Si faltan costos por capturar, el margen sale más alto de lo real.",
  average: "Ventas entre número de pedidos.",
  refunds: "Pedidos pagados que se reembolsaron, contados el día en que se cancelaron. No están en las ventas.",
  source: "De dónde sale lo vendido. Es interno: en la tienda todo aparece como vendido por Kadesh.",
};

const pesos = (cents: number) => formatCents(Math.round(cents));
const count = (value: number) => value.toLocaleString("es-MX");

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-11-19" → "19 nov"; "2026-11" → "nov 26". */
function bucketLabel(key: string, unit: "day" | "month"): string {
  if (unit === "month") return `${MONTHS[Number(key.slice(5, 7)) - 1] ?? key} ${key.slice(2, 4)}`;
  return formatDateShort(`${key}T12:00:00`, false);
}

/**
 * Tienda → Resumen: what the store sold in a period, what it cost and what needs attention in the
 * catalog. One request when it opens or the period changes; the backend keeps the answer 5 minutes.
 */
export default function AdminStoreSummaryPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const days =
    STORE_SUMMARY_DAY_OPTIONS.find((option) => option.value === searchParams.get("dias"))?.value ??
    String(STORE_SUMMARY_DEFAULT_DAYS);
  const { data, loading, error } = useQuery<AdminStoreSummaryResponse>(ADMIN_STORE_SUMMARY_QUERY, {
    variables: { days: Number(days) },
    fetchPolicy: "cache-and-network",
  });
  const summary = data?.adminStoreSummary;

  const periodChips = (
    <AdminFilterChips
      options={[...STORE_SUMMARY_DAY_OPTIONS]}
      value={days}
      onChange={(value) => setParams({ dias: value === String(STORE_SUMMARY_DEFAULT_DAYS) ? null : value })}
    />
  );

  if (error && !summary) {
    return <AdminErrorState message={adminErrorText(error, "No se pudo cargar el resumen. Intenta de nuevo.")} />;
  }
  if (!summary) return loading ? <AdminLoadingRows rows={6} /> : null;

  const periodLabel = STORE_SUMMARY_DAY_OPTIONS.find((option) => option.value === String(summary.days))?.label ?? "";
  const marginPct = summary.revenueCents > 0 ? Math.round((summary.marginCents / summary.revenueCents) * 100) : null;
  const byMonth = summary.seriesUnit === "month";
  const lastKey = summary.series[summary.series.length - 1]?.key;
  const goToProducts = () => setParams({ seccion: STORE_SECTIONS.PRODUCTS, dias: null });

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide note={`Del ${bucketLabel(summary.from, "day")} al ${bucketLabel(summary.to, "day")}, hora del centro de México. Se actualiza cada 5 minutos.`}>
        Lo que vendió la tienda, lo que costó y lo que hay que atender en el catálogo. Una venta es un
        pedido pagado que no se ha reembolsado; no cuentan los pedidos de cuentas de prueba.
      </ViewGuide>

      <div className="flex justify-end">{periodChips}</div>

      {summary.orders === 0 && summary.refundedOrders === 0 ? (
        <AdminEmptyState
          title={`Sin ventas en ${periodLabel}`}
          description="Cuando se pague el primer pedido de este periodo, aquí salen las ventas, el margen y lo más vendido."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <AdminStatTile
              variant="dark"
              label="Ventas"
              value={pesos(summary.revenueCents)}
              hint={`${count(summary.orders)} ${summary.orders === 1 ? "pedido" : "pedidos"}`}
              help={HELP.revenue}
              delta={storeSummaryDelta(summary.revenueCents, summary.previousRevenueCents, pesos)}
            />
            <AdminStatTile
              variant="tint"
              label="Margen"
              value={pesos(summary.marginCents)}
              hint={marginPct != null ? `${marginPct} % de las ventas, antes de comisiones` : "Antes de comisiones"}
              help={HELP.margin}
              tone={summary.marginCents < 0 ? "danger" : "default"}
            />
            <AdminStatTile
              label="Pedidos"
              value={count(summary.orders)}
              hint={`${count(summary.units)} ${summary.units === 1 ? "pieza" : "piezas"}`}
              delta={storeSummaryDelta(summary.orders, summary.previousOrders, count)}
            />
            <AdminStatTile label="Pedido promedio" value={pesos(summary.averageOrderCents)} help={HELP.average} />
            <AdminStatTile
              label="Personas que compraron"
              value={count(summary.buyers)}
              hint={summary.discountCents > 0 ? `${pesos(summary.discountCents)} en cupones` : "Sin cupones usados"}
            />
            <AdminStatTile
              label="Reembolsos"
              value={pesos(summary.refundedCents)}
              hint={`${count(summary.refundedOrders)} ${summary.refundedOrders === 1 ? "pedido" : "pedidos"}`}
              help={HELP.refunds}
              tone={summary.refundedOrders > 0 ? "warning" : "default"}
            />
          </div>

          <AdminSectionCard
            title={byMonth ? "Ventas por mes" : "Ventas por día"}
            description="Por el día en que se pagó cada pedido."
          >
            <ColumnBars
              points={summary.series.map((point) => ({
                key: point.key,
                label: bucketLabel(point.key, summary.seriesUnit),
                value: Math.round(point.revenueCents / 100),
                title: `${bucketLabel(point.key, summary.seriesUnit)}: ${pesos(point.revenueCents)} en ${count(point.orders)} ${point.orders === 1 ? "pedido" : "pedidos"}`,
                current: point.key === lastKey,
              }))}
              ariaLabel={byMonth ? "Ventas por mes en pesos" : "Ventas por día en pesos"}
              unitLabel="pesos"
              heightClass="h-44"
              formatValue={(value) => `$${count(value)}`}
            />
          </AdminSectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <AdminSectionCard title="Lo más vendido" description="Por lo que dejaron, ya con cupones." index={1}>
              <HBarList
                items={summary.topProducts.map((product, index) => ({
                  key: product.productId ?? `gone-${index}`,
                  label: `${product.name} · ${count(product.units)} ${product.units === 1 ? "pieza" : "piezas"}`,
                  count: Math.round(product.revenueCents / 100),
                }))}
                emptyLabel="Sin productos vendidos en este periodo."
                formatValue={(value) => `$${count(value)}`}
              />
            </AdminSectionCard>

            <div className="flex flex-col gap-4">
              <AdminSectionCard title="De dónde sale lo vendido" help={HELP.source} index={2}>
                {summary.bySource.length === 0 ? (
                  <p className="text-sm text-dash-muted">Sin ventas en este periodo.</p>
                ) : (
                  <ul className="divide-y divide-dash-line">
                    {summary.bySource.map((row) => (
                      <li key={row.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
                        <span className="font-semibold text-dash-ink">{STORE_SOURCE_LABELS[row.key] ?? "Sin origen"}</span>
                        <span className="tabular-nums text-dash-soft">
                          {pesos(row.revenueCents)} · costo {pesos(row.costCents)} · {count(row.units)} pzas
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AdminSectionCard>

              <AdminSectionCard title="Cómo pagaron" index={3}>
                <HBarList
                  items={summary.byPaymentMethod.map((row) => ({
                    key: row.key,
                    label: `${STORE_PAYMENT_METHOD_LABELS[row.key] ?? row.key} · ${count(row.count)} ${row.count === 1 ? "pedido" : "pedidos"}`,
                    count: Math.round(row.amount / 100),
                  }))}
                  emptyLabel="Sin pagos en este periodo."
                  formatValue={(value) => `$${count(value)}`}
                />
              </AdminSectionCard>

              <AdminSectionCard title="Cupones más usados" index={4}>
                {summary.topCoupons.length === 0 ? (
                  <p className="text-sm text-dash-muted">Nadie usó un cupón en este periodo.</p>
                ) : (
                  <ul className="divide-y divide-dash-line">
                    {summary.topCoupons.map((coupon) => (
                      <li key={coupon.code} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                        <span className="min-w-0 font-mono font-semibold tracking-wide text-dash-ink [overflow-wrap:anywhere]">{coupon.code}</span>
                        <span className="shrink-0 tabular-nums text-dash-soft">
                          {count(coupon.uses)} {coupon.uses === 1 ? "uso" : "usos"}
                          {coupon.discountCents > 0 ? ` · ${pesos(coupon.discountCents)} de descuento` : " · envío gratis"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AdminSectionCard>
            </div>
          </div>
        </>
      )}

      <AdminSectionCard
        title="Inventario ahora"
        description="Productos activos con stock contado. No depende del periodo."
        action={
          <AdminButton variant="ghost" size="sm" onClick={goToProducts}>
            Ver productos
          </AdminButton>
        }
        index={5}
      >
        <p className="text-sm text-dash-ink">
          <span className={summary.outOfStock > 0 ? "font-semibold text-red-700 dark:text-red-400" : "font-semibold"}>
            {count(summary.outOfStock)}
          </span>{" "}
          {summary.outOfStock === 1 ? "producto agotado" : "productos agotados"}
          {summary.outOfStock > 0 ? ": salen en la tienda como «Agotado»." : "."}
        </p>
        {summary.lowStock.length > 0 ? (
          <>
            <p className="mb-1 mt-4 text-[13px] font-semibold text-dash-soft">Por agotarse</p>
            <ul className="divide-y divide-dash-line">
              {summary.lowStock.map((product) => (
                <li key={product.productId} className="flex items-center justify-between gap-4 py-1">
                  <button
                    type="button"
                    onClick={() => setParams({ seccion: STORE_SECTIONS.PRODUCTS, producto: product.productId, dias: null }, "push")}
                    className="min-h-11 min-w-0 truncate rounded-md text-left text-sm font-medium text-dash-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                  >
                    {product.name}
                  </button>
                  <span className="shrink-0 text-sm tabular-nums text-amber-700 dark:text-amber-400">
                    {product.stockTotal === 1 ? "queda 1" : `quedan ${count(product.stockTotal)}`}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-dash-muted">Ningún producto está por agotarse.</p>
        )}
      </AdminSectionCard>
    </div>
  );
}
