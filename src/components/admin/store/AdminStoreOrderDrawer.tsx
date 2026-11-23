"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { ConfirmModal, ModalPortal } from "kadesh/components/shared";
import { formatDateShort } from "kadesh/utils/format-date";
import { adminErrorText } from "../errors";
import {
  AdminButton,
  AdminDrawer,
  AdminErrorState,
  AdminLoadingRows,
  AdminStatusBadge,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
  formatPersonName,
} from "../ui";
import StoreOrderBadges from "./StoreOrderBadges";
import {
  STORE_PAYMENT_ATTEMPT_STATUS_LABELS,
  STORE_PAYMENT_METHOD_LABELS,
  STORE_SHIPMENT_PROVIDER_LABELS,
  STORE_SHIPMENT_STATUS_LABELS,
  STORE_SOURCE_CLASS,
  STORE_SOURCE_LABELS,
  centsToInput,
  formatCents,
  inputToCents,
} from "./constants";
import {
  ADMIN_CANCEL_STORE_ORDER_MUTATION,
  ADMIN_REFUND_STORE_ORDER_MUTATION,
  ADMIN_REVIEW_STORE_TRANSFER_MUTATION,
  ADMIN_SET_STORE_ORDER_NOTE_MUTATION,
  ADMIN_STORE_ORDER_QUERY,
  ADMIN_UPDATE_STORE_SHIPMENT_MUTATION,
  type AdminStoreActionResult,
  type AdminStoreOrderDetail,
  type AdminStoreShipment,
} from "./order-queries";

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-dash-ink">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="shrink-0 text-dash-muted">{label}</span>
      <span className="min-w-0 text-right text-dash-ink [overflow-wrap:anywhere]">{children}</span>
    </div>
  );
}

/** Form of one package: status, carrier, tracking and what it cost to ship. */
function ShipmentEditor({
  shipment,
  itemNames,
  disabled,
  onSave,
}: {
  shipment: AdminStoreShipment;
  itemNames: string[];
  disabled: boolean;
  /** Resolves with the backend's message when it refused the change (e.g. a status jump it does not allow). */
  onSave: (input: Record<string, unknown>) => Promise<string | null>;
}) {
  const [status, setStatus] = useState(shipment.status);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Only the statuses the backend allows from here (the current one first): own packages never
  // get the Dropi steps, and a package cannot jump, say, from «Por preparar» to «Devuelto».
  const statusValues = shipment.nextStatuses.length > 0 ? shipment.nextStatuses : [shipment.status];
  const [carrier, setCarrier] = useState(shipment.carrier ?? "");
  const [trackingCode, setTrackingCode] = useState(shipment.trackingCode ?? "");
  const [trackingUrl, setTrackingUrl] = useState(shipment.trackingUrl ?? "");
  const [cost, setCost] = useState(centsToInput(shipment.shippingCostCents));

  async function save() {
    const costCents = inputToCents(cost);
    if (Number.isNaN(costCents)) return void sileo.warning({ title: "El costo del envío no es válido." });
    if (trackingUrl.trim() && !/^https:\/\//i.test(trackingUrl.trim())) {
      return void sileo.warning({ title: "El enlace de rastreo debe empezar con https://." });
    }
    setSaveError(null);
    const refused = await onSave({
      status,
      carrier: carrier.trim(),
      trackingCode: trackingCode.trim(),
      trackingUrl: trackingUrl.trim(),
      ...(costCents !== null ? { shippingCostCents: costCents } : {}),
    });
    setSaveError(refused);
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-dash-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusBadge
          label={STORE_SHIPMENT_PROVIDER_LABELS[shipment.provider] ?? shipment.provider}
          className={shipment.provider === "dropi" ? STORE_SOURCE_CLASS.dropi : STORE_SOURCE_CLASS.own}
        />
        <span className="text-sm font-semibold text-dash-ink">
          {STORE_SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status}
        </span>
        {shipment.shippedAt ? (
          <span className="text-xs text-dash-faint">Salió el {formatDateShort(shipment.shippedAt)}</span>
        ) : null}
      </div>
      <p className="text-sm text-dash-soft">{itemNames.join(" · ") || "Sin productos"}</p>
      {shipment.provider === "dropi" && shipment.status === "pending_approval" ? (
        <p className="rounded-xl bg-dash-surface-2 px-3 py-2 text-[13px] text-dash-soft">
          Pide estos productos en Dropi con la dirección de este pedido, y captura aquí la paquetería y la guía que te
          dé. Al comprador nunca se le nombra a Dropi.
        </p>
      ) : null}
      {shipment.lastError ? <p className="text-sm text-red-700 dark:text-red-400">{shipment.lastError}</p> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={adminLabelClass}>Estatus</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={adminSelectClass}>
            {statusValues.map((value) => (
              <option key={value} value={value}>
                {STORE_SHIPMENT_STATUS_LABELS[value] ?? value}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={adminLabelClass}>Paquetería</span>
          <input value={carrier} onChange={(event) => setCarrier(event.target.value)} className={adminInputClass} />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Guía</span>
          <input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} className={adminInputClass} />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Costo del envío (interno)</span>
          <input
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            className={adminInputClass}
            inputMode="decimal"
            placeholder="0.00"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={adminLabelClass}>Enlace de rastreo</span>
          <input
            value={trackingUrl}
            onChange={(event) => setTrackingUrl(event.target.value)}
            className={adminInputClass}
            inputMode="url"
            placeholder="https://…"
          />
        </label>
      </div>
      {saveError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {saveError}
        </p>
      ) : null}
      <AdminButton variant="outline" size="sm" onClick={() => void save()} disabled={disabled} className="self-start">
        Guardar envío
      </AdminButton>
      <p className="text-xs text-dash-faint">
        La primera vez que pasa a «Guía generada», «En camino» o «Entregado» le avisamos a quien compró, con la guía.
      </p>
    </li>
  );
}

/**
 * Detail of a store order: who bought, where it goes, what it carries (with where each product
 * comes from and what it cost), its payment, its packages and everything that happened to it,
 * with who did each step.
 */
export default function AdminStoreOrderDrawer({
  orderId,
  onClose,
  onChanged,
}: {
  orderId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { data, loading, error, refetch } = useQuery<{ adminStoreOrder: AdminStoreOrderDetail | null }>(
    ADMIN_STORE_ORDER_QUERY,
    // The proof image URL is signed for 1 h: always fresh.
    { variables: { id: orderId }, skip: !orderId, fetchPolicy: "network-only" },
  );
  const detail = orderId ? data?.adminStoreOrder ?? null : null;

  return (
    <AdminDrawer
      open={Boolean(orderId)}
      onClose={onClose}
      title={detail ? `Pedido ${detail.order.number}` : "Pedido"}
      subtitle={detail ? `Hecho el ${formatDateShort(detail.order.createdAt)}` : undefined}
      ariaLabel="Detalle del pedido"
    >
      {error ? (
        <AdminErrorState message={adminErrorText(error, "No se pudo cargar el pedido.")} />
      ) : !detail ? (
        loading ? (
          <AdminLoadingRows rows={6} />
        ) : (
          <AdminErrorState message="No encontramos este pedido." />
        )
      ) : (
        <OrderBody
          key={detail.order.id}
          detail={detail}
          onDone={async () => {
            await refetch();
            onChanged();
          }}
        />
      )}
    </AdminDrawer>
  );
}

function OrderBody({ detail, onDone }: { detail: AdminStoreOrderDetail; onDone: () => Promise<void> }) {
  const { order } = detail;
  const [busy, setBusy] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [reason, setReason] = useState("");
  const [restock, setRestock] = useState(true);
  const [note, setNote] = useState(detail.adminNote ?? "");
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmPaid, setConfirmPaid] = useState(false);

  const [reviewTransfer] = useMutation(ADMIN_REVIEW_STORE_TRANSFER_MUTATION);
  const [updateShipment] = useMutation(ADMIN_UPDATE_STORE_SHIPMENT_MUTATION);
  const [cancelOrder] = useMutation(ADMIN_CANCEL_STORE_ORDER_MUTATION);
  const [refundOrder] = useMutation(ADMIN_REFUND_STORE_ORDER_MUTATION);
  const [setOrderNote] = useMutation(ADMIN_SET_STORE_ORDER_NOTE_MUTATION);

  /**
   * Runs one admin action and shows what the backend answered. Resolves with `null` when it went
   * through, or with the message of why not (the backend explains in Spanish).
   */
  async function run(
    mutate: (options: { variables: Record<string, unknown> }) => Promise<{ data?: unknown }>,
    field: string,
    variables: Record<string, unknown>,
  ): Promise<string | null> {
    setBusy(true);
    try {
      const { data } = await mutate({ variables });
      const result = (data as Record<string, AdminStoreActionResult> | undefined)?.[field];
      if (result?.success) sileo.success({ title: result.message });
      else sileo.error({ title: "No se pudo", description: result?.message });
      await onDone();
      return result?.success ? null : result?.message || "No se pudo. Intenta de nuevo.";
    } catch (err) {
      const message = adminErrorText(err, "Intenta de nuevo.");
      sileo.error({ title: "No se pudo", description: message });
      return message;
    } finally {
      setBusy(false);
    }
  }

  const open = order.status === "open";
  const paid = order.paymentStatus === "paid";
  const transfer = order.paymentMethod === "bank_transfer";
  const awaitingTransfer = open && transfer && (order.paymentStatus === "in_review" || order.paymentStatus === "pending");
  // Approving or rejecting only makes sense with a proof waiting for review. A rejected proof
  // comes back as a `pending` attempt with the reason in `errorMessage` (payments: newest first).
  const inReview = order.paymentStatus === "in_review";
  const proof = inReview
    ? detail.payments.find((payment) => payment.transferProofUrl && payment.status === "in_review") ??
      detail.payments.find((payment) => payment.transferProofUrl)
    : null;
  const rejectedProof = inReview
    ? null
    : detail.payments.find((payment) => payment.transferProofUrl && payment.status === "pending" && payment.errorMessage);
  // What the person paid (already without the coupon discount) minus what it cost.
  const margin = order.totalCents - detail.costCents - detail.shippingCostCents;
  const address = detail.address;
  const addressText = [
    address.recipientName,
    `${address.street} ${address.exteriorNumber}${address.interiorNumber ? ` int. ${address.interiorNumber}` : ""}`,
    `Col. ${address.neighborhood}, C.P. ${address.postalCode}`,
    `${address.city}, ${address.stateName}`,
    `Tel. ${address.phone}`,
    address.references ? `Referencias: ${address.references}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <StoreOrderBadges order={order} />
        <span className="text-sm text-dash-muted">{STORE_PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
      </div>
      {detail.cancelReason ? (
        <p className="rounded-2xl bg-dash-surface-2 px-4 py-3 text-sm text-dash-soft">
          <span className="font-semibold text-dash-ink">Motivo de cancelación: </span>
          {detail.cancelReason}
        </p>
      ) : null}
      {order.status === "cancelled" && paid ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
          Llegó el pago de este pedido después de cancelarlo. Reembólsalo desde aquí abajo.
        </p>
      ) : null}

      {awaitingTransfer && !inReview ? (
        <Section title="Esperando la transferencia">
          {rejectedProof ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
              <span className="font-semibold">Comprobante rechazado: </span>
              {rejectedProof.errorMessage}
            </p>
          ) : (
            <p className="text-sm text-dash-muted">
              No ha subido comprobante aquí. Normalmente llega por WhatsApp con el folio {order.number}.
            </p>
          )}
          <Row label="Debe decir">{formatCents(order.totalCents)}</Row>
          <Row label="Concepto">{order.number}</Row>
          <p className="text-[13px] text-dash-muted">
            Confirma solo si el dinero ya está en la cuenta del banco: el comprobante por sí solo no es el pago.
          </p>
          {/* Proofs usually come by WhatsApp: the payment is confirmed from here without an upload. */}
          <AdminButton
            onClick={() => setConfirmPaid(true)}
            disabled={busy}
            className="self-start"
          >
            El dinero llegó: confirmar pago
          </AdminButton>
        </Section>
      ) : null}

      {awaitingTransfer && inReview ? (
        <Section title="Transferencia por confirmar">
          {proof?.transferProofUrl ? (
            <a href={proof.transferProofUrl} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proof.transferProofUrl}
                alt="Comprobante de la transferencia"
                className="max-h-80 w-full rounded-2xl border border-dash-line object-contain"
              />
            </a>
          ) : (
            <p className="text-sm text-dash-muted">Todavía no sube su comprobante.</p>
          )}
          <Row label="Debe decir">{formatCents(order.totalCents)}</Row>
          <Row label="Concepto">{order.number}</Row>
          {proof?.transferReference ? <Row label="Referencia que escribió">{proof.transferReference}</Row> : null}
          <p className="text-[13px] text-dash-muted">
            Confirma solo si el dinero ya está en la cuenta del banco: el comprobante por sí solo no es el pago.
          </p>
          <AdminButton
            onClick={() => setConfirmPaid(true)}
            disabled={busy}
            className="self-start"
          >
            El dinero llegó: confirmar pago
          </AdminButton>
          <div className="flex flex-col gap-2">
            <label className="block">
              <span className={adminLabelClass}>Si no se puede confirmar, dile por qué</span>
              <input
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                className={adminInputClass}
                placeholder="El monto no coincide con el total del pedido"
                maxLength={300}
              />
            </label>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() =>
                void run(reviewTransfer, "adminReviewStoreTransfer", { orderId: order.id, approve: false, note: rejectNote.trim() })
              }
              disabled={busy || !rejectNote.trim()}
              className="self-start"
            >
              Rechazar comprobante
            </AdminButton>
          </div>
        </Section>
      ) : null}

      {detail.shipments.length > 0 ? (
        <Section title={detail.shipments.length === 1 ? "Envío" : `Envíos (${detail.shipments.length})`}>
          <ul className="flex flex-col gap-3">
            {detail.shipments.map((shipment) => (
              <ShipmentEditor
                key={`${shipment.id}-${shipment.status}-${shipment.trackingCode ?? ""}`}
                shipment={shipment}
                itemNames={detail.items
                  .filter((item) => item.shipmentId === shipment.id)
                  .map((item) => `${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ""}`)}
                disabled={busy}
                onSave={(input) => run(updateShipment, "adminUpdateStoreShipment", { shipmentId: shipment.id, input })}
              />
            ))}
          </ul>
        </Section>
      ) : paid ? null : (
        <p className="text-sm text-dash-muted">Los envíos se crean cuando el pedido se paga.</p>
      )}

      <Section
        title="Enviar a"
        aside={
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(addressText).then(() => sileo.success({ title: "Dirección copiada" }));
            }}
          >
            Copiar
          </AdminButton>
        }
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-dash-ink">{addressText}</p>
        {detail.customerNote ? (
          <p className="rounded-2xl bg-dash-surface-2 px-4 py-3 text-sm text-dash-soft">
            <span className="font-semibold text-dash-ink">Nota de quien compró: </span>
            {detail.customerNote}
          </p>
        ) : null}
      </Section>

      <Section title="Quién compró">
        <Row label="Nombre">{order.customerName || (detail.user ? formatPersonName(detail.user.name, detail.user.lastName) : "—")}</Row>
        <Row label="Correo">{order.email || "—"}</Row>
        <Row label="Teléfono">{detail.phone || "—"}</Row>
        {order.guestCheckout ? <Row label="Cuenta">Se creó con este pedido</Row> : null}
      </Section>

      <Section title="Productos">
        <ul className="flex flex-col divide-y divide-dash-line">
          {detail.items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3">
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.coverUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
              ) : (
                <span className="size-12 shrink-0 rounded-xl bg-dash-surface-2" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-dash-ink">
                  {item.name}
                  {item.variantTitle ? <span className="font-normal text-dash-soft"> · {item.variantTitle}</span> : null}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-dash-muted">
                  <AdminStatusBadge
                    label={STORE_SOURCE_LABELS[item.source ?? ""] ?? item.source ?? "—"}
                    className={STORE_SOURCE_CLASS[item.source ?? ""] ?? STORE_SOURCE_CLASS.own}
                  />
                  {item.source === "dropi" && item.externalId ? <span>Dropi #{item.externalId}</span> : null}
                  {item.dropiVariationId ? <span>variación {item.dropiVariationId}</span> : null}
                  {item.sku ? <span>SKU {item.sku}</span> : null}
                </p>
                <p className="mt-0.5 text-xs text-dash-faint">
                  {item.quantity} × {formatCents(item.unitPriceCents)}
                  {item.unitCostCents != null ? ` · costo ${formatCents(item.unitCostCents)} c/u` : ""}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-dash-ink">{formatCents(item.totalCents)}</span>
            </li>
          ))}
        </ul>
        <Row label="Subtotal">{formatCents(detail.subtotalCents)}</Row>
        {detail.couponCode ? (
          <Row label={`Cupón ${detail.couponCode}`}>
            {detail.couponDiscountCents > 0 ? `−${formatCents(detail.couponDiscountCents)}` : "Envío gratis"}
          </Row>
        ) : null}
        <Row label="Envío que pagó">{detail.shippingCents > 0 ? formatCents(detail.shippingCents) : "Gratis"}</Row>
        <Row label="Total">
          <span className="font-semibold">{formatCents(order.totalCents)}</span>
        </Row>
        <div className="mt-1 rounded-2xl bg-dash-surface-2 px-4 py-3">
          <Row label="Costo de los productos">{formatCents(detail.costCents)}</Row>
          <Row label="Costo de los envíos">{formatCents(detail.shippingCostCents)}</Row>
          <Row label="Margen (antes de comisiones)">
            <span className={margin < 0 ? "font-semibold text-red-700 dark:text-red-400" : "font-semibold"}>{formatCents(margin)}</span>
          </Row>
        </div>
      </Section>

      <Section title="Pago">
        {detail.payments.length === 0 ? <p className="text-sm text-dash-muted">Sin intentos de pago.</p> : null}
        {detail.payments.map((payment) => (
          <div key={payment.id} className="flex flex-col gap-1 rounded-2xl border border-dash-line p-4">
            <Row label={STORE_PAYMENT_METHOD_LABELS[payment.provider] ?? payment.provider}>
              {formatCents(payment.amountCents)} · {STORE_PAYMENT_ATTEMPT_STATUS_LABELS[payment.status] ?? payment.status}
            </Row>
            {payment.stripePaymentIntentId ? <Row label="PaymentIntent">{payment.stripePaymentIntentId}</Row> : null}
            {payment.reviewedBy ? (
              <Row label="Lo revisó">
                {formatPersonName(payment.reviewedBy.name, payment.reviewedBy.lastName)} · {formatDateShort(payment.reviewedAt)}
              </Row>
            ) : null}
            {payment.refundedCents ? <Row label="Reembolsado">{formatCents(payment.refundedCents)}</Row> : null}
            {payment.errorMessage ? (
              <p className="text-sm text-red-700 dark:text-red-400">
                {payment.provider === "bank_transfer" && payment.status === "pending" && payment.transferProofUrl
                  ? `Comprobante rechazado: ${payment.errorMessage}`
                  : payment.errorMessage}
              </p>
            ) : null}
          </div>
        ))}
        {detail.paidAt ? <Row label="Pagado el">{formatDateShort(detail.paidAt)}</Row> : null}
        {open && order.paymentStatus === "pending" && order.expiresAt ? (
          <Row label="Se cancela solo el">{formatDateShort(order.expiresAt)}</Row>
        ) : null}
      </Section>

      <Section title="Nota interna">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={adminTextareaClass}
          placeholder="Solo la ve el equipo de Kadesh."
          maxLength={2000}
        />
        <AdminButton
          variant="outline"
          size="sm"
          onClick={() => void run(setOrderNote, "adminSetStoreOrderNote", { orderId: order.id, note })}
          disabled={busy || note === (detail.adminNote ?? "")}
          className="self-start"
        >
          Guardar nota
        </AdminButton>
      </Section>

      <Section title="Lo que ha pasado">
        <ol className="flex flex-col gap-3">
          {detail.events.map((event) => (
            <li key={event.id} className="border-l-2 border-dash-line pl-3">
              <p className="text-sm text-dash-ink">{event.message || event.type}</p>
              <p className="mt-0.5 text-xs text-dash-faint">
                {formatDateShort(event.createdAt)} ·{" "}
                {event.actor ? formatPersonName(event.actor.name, event.actor.lastName) : "Sistema"}
                {event.isPublic ? "" : " · solo interno"}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {paid || (open && !paid) ? (
        <Section title={paid ? "Reembolsar" : "Cancelar pedido"}>
          <p className="text-[13px] text-dash-muted">
            {paid
              ? transfer
                ? "Cancela el pedido. Pagó por transferencia: el dinero se le devuelve desde el banco, no desde aquí."
                : "Devuelve el total a su tarjeta por Stripe y cancela el pedido. No se puede deshacer."
              : "Cancela un pedido que no se ha pagado y regresa el stock. Si ya pagó, aquí aparecerá Reembolsar."}
          </p>
          <label className="block">
            <span className={adminLabelClass}>Motivo (lo lee quien compró)</span>
            <input value={reason} onChange={(event) => setReason(event.target.value)} className={adminInputClass} maxLength={300} />
          </label>
          {paid ? (
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-dash-ink">
              <input
                type="checkbox"
                checked={restock}
                onChange={(event) => setRestock(event.target.checked)}
                className="size-4 accent-orange-500"
              />
              Regresar los productos al stock
            </label>
          ) : null}
          <AdminButton
            variant="danger"
            size="sm"
            disabled={busy || !reason.trim()}
            onClick={() => setConfirmClose(true)}
            className="self-start"
          >
            {paid ? "Reembolsar pedido" : "Cancelar pedido"}
          </AdminButton>
          <ModalPortal>
            <ConfirmModal
              isOpen={confirmPaid}
              onClose={() => {
                if (!busy) setConfirmPaid(false);
              }}
              onConfirm={() => {
                void run(reviewTransfer, "adminReviewStoreTransfer", { orderId: order.id, approve: true }).finally(() =>
                  setConfirmPaid(false),
                );
              }}
              title="Confirmar pago"
              message={`¿Ya está en el banco la transferencia de ${formatCents(order.totalCents)} con concepto ${order.number}? El pedido queda pagado y se avisa al cliente.`}
              confirmText="Sí, confirmar pago"
              cancelText="Volver"
              isLoading={busy}
              stackedOverModal
            />
          </ModalPortal>
          <ModalPortal>
            <ConfirmModal
              isOpen={confirmClose}
              onClose={() => {
                if (!busy) setConfirmClose(false);
              }}
              onConfirm={() => {
                void (
                  paid
                    ? run(refundOrder, "adminRefundStoreOrder", { orderId: order.id, reason: reason.trim(), restock })
                    : run(cancelOrder, "adminCancelStoreOrder", { orderId: order.id, reason: reason.trim() })
                ).finally(() => setConfirmClose(false));
              }}
              title={paid ? "Reembolsar pedido" : "Cancelar pedido"}
              message={
                paid
                  ? `¿Reembolsar ${formatCents(order.totalCents)} del pedido ${order.number}? No se puede deshacer.`
                  : `¿Cancelar el pedido ${order.number}? Su stock regresa a la tienda.`
              }
              confirmText={paid ? "Reembolsar" : "Cancelar pedido"}
              cancelText="Volver"
              isLoading={busy}
              confirmButtonColor="red"
              stackedOverModal
            />
          </ModalPortal>
        </Section>
      ) : null}
    </div>
  );
}
