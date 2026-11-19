import { AdminStatusBadge } from "../ui";
import {
  STORE_FULFILLMENT_CLASS,
  STORE_FULFILLMENT_LABELS,
  STORE_PAYMENT_STATUS_CLASS,
  STORE_PAYMENT_STATUS_LABELS,
  isStoreOrderCancelled,
} from "./constants";
import type { AdminStoreOrderRow } from "./order-queries";

/** The badges of a row: a cancelled order says only that; otherwise its payment and its shipping. */
export default function StoreOrderBadges({ order }: { order: Pick<AdminStoreOrderRow, "status" | "paymentStatus" | "fulfillmentStatus"> }) {
  if (isStoreOrderCancelled(order.status)) {
    return (
      <>
        <AdminStatusBadge label="Cancelado" className="bg-stone-200 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300" />
        {order.paymentStatus === "refunded" || order.paymentStatus === "paid" ? (
          <AdminStatusBadge
            label={order.paymentStatus === "paid" ? "Pagado: falta reembolsar" : STORE_PAYMENT_STATUS_LABELS.refunded}
            className={order.paymentStatus === "paid" ? STORE_PAYMENT_STATUS_CLASS.failed : STORE_PAYMENT_STATUS_CLASS.refunded}
          />
        ) : null}
      </>
    );
  }
  return (
    <>
      <AdminStatusBadge
        label={STORE_PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
        className={STORE_PAYMENT_STATUS_CLASS[order.paymentStatus] ?? STORE_PAYMENT_STATUS_CLASS.pending}
      />
      {order.paymentStatus === "paid" ? (
        <AdminStatusBadge
          label={STORE_FULFILLMENT_LABELS[order.fulfillmentStatus] ?? order.fulfillmentStatus}
          className={STORE_FULFILLMENT_CLASS[order.fulfillmentStatus] ?? STORE_FULFILLMENT_CLASS.unfulfilled}
        />
      ) : null}
    </>
  );
}
