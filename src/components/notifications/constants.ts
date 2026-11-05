import {
  Bone01Icon,
  BankIcon,
  Calendar03Icon,
  StethoscopeIcon,
  Notification01Icon,
  SecurityBlockIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { ADMIN_TABS } from "kadesh/components/admin/constants";
import type { NotificationItem } from "./queries";

/** Mismos valores que `NOTIFICATION_TYPE` en kadesh-back (`models/Notification/constants.ts`). */
export const NOTIFICATION_TYPE = {
  ANIMAL_CREATED: "animal.created",
  PET_PLACE_SERVICE_REQUESTED: "petplace.service_requested",
  /** Un evento de Kadesh Pet nuevo o editado espera revisión (a los admins). */
  EVENT_SUBMITTED: "event.submitted",
  USER_BANK_DETAILS_UPDATED: "user.bank_details_updated",
  /** Alguien se pasó de un límite contra abuso (fase 6.5). */
  SECURITY_ALERT: "security.alert",
} as const;

/** Cada cuánto se revisa el contador de no leídas (sin websockets en esta fase). */
export const NOTIFICATIONS_POLL_MS = 60_000;
export const NOTIFICATIONS_PAGE_SIZE = 20;

export function notificationIcon(type: string | null) {
  switch (type) {
    case NOTIFICATION_TYPE.ANIMAL_CREATED:
      return Bone01Icon;
    case NOTIFICATION_TYPE.PET_PLACE_SERVICE_REQUESTED:
      return StethoscopeIcon;
    case NOTIFICATION_TYPE.EVENT_SUBMITTED:
      return Calendar03Icon;
    case NOTIFICATION_TYPE.USER_BANK_DETAILS_UPDATED:
      return BankIcon;
    case NOTIFICATION_TYPE.SECURITY_ALERT:
      return SecurityBlockIcon;
    default:
      return Notification01Icon;
  }
}

/** A dónde lleva el clic: la sección de Operaciones que resuelve el aviso. */
export function notificationHref(item: NotificationItem): string | null {
  switch (item.type) {
    case NOTIFICATION_TYPE.ANIMAL_CREATED:
      return item.entityId
        ? Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "animales", animal: item.entityId })
        : Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "animales" });
    case NOTIFICATION_TYPE.PET_PLACE_SERVICE_REQUESTED:
      return Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "servicios" });
    case NOTIFICATION_TYPE.EVENT_SUBMITTED:
      return item.entityId
        ? Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "eventos", evento: item.entityId })
        : Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "eventos" });
    case NOTIFICATION_TYPE.USER_BANK_DETAILS_UPDATED:
      return Routes.panelAdminTab(ADMIN_TABS.CLIENTS);
    // El back manda la Actividad filtrada por la IP; si no, Seguridad.
    case NOTIFICATION_TYPE.SECURITY_ALERT:
      return item.url || Routes.panelAdminTab(ADMIN_TABS.SECURITY);
    default:
      return item.url || null;
  }
}
