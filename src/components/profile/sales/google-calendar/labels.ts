import type { GoogleCalendarAccountItem, GoogleCalendarSelectionItem } from "./queries";

export const SHARED_ACCOUNT_LABEL = "Cuenta compartida de la empresa";

/** Nombre a mostrar de una cuenta: la compartida no expone el correo de quien la conectó. */
export function accountDisplayLabel(
  account: Pick<GoogleCalendarAccountItem, "scopeType" | "googleAccountEmail">,
): string {
  return account.scopeType === "company" ? SHARED_ACCOUNT_LABEL : account.googleAccountEmail;
}

/**
 * Nombre a mostrar de un calendario. El calendario principal de una cuenta se llama como su
 * correo, así que en la cuenta compartida se muestra "Principal" en vez del correo del admin.
 */
export function calendarDisplayName(
  account: Pick<GoogleCalendarAccountItem, "scopeType">,
  calendar: Pick<GoogleCalendarSelectionItem, "calendarName" | "isPrimary">,
): string {
  return account.scopeType === "company" && calendar.isPrimary ? "Principal" : calendar.calendarName;
}
