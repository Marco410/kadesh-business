import {
  Bone01Icon,
  BankIcon,
  StethoscopeIcon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { ADMIN_TABS } from "kadesh/components/admin/constants";
import type { NotificationItem } from "./queries";

/** Mismos valores que `NOTIFICATION_TYPE` en kadesh-back (`models/Notification/constants.ts`). */
export const NOTIFICATION_TYPE = {
  ANIMAL_CREATED: "animal.created",
  PET_PLACE_SERVICE_REQUESTED: "petplace.service_requested",
  USER_BANK_DETAILS_UPDATED: "user.bank_details_updated",
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
    case NOTIFICATION_TYPE.USER_BANK_DETAILS_UPDATED:
      return BankIcon;
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
    case NOTIFICATION_TYPE.USER_BANK_DETAILS_UPDATED:
      return Routes.panelAdminTab(ADMIN_TABS.CLIENTS);
    default:
      return item.url || null;
  }
}
