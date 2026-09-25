"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  GOOGLE_CALENDAR_ACCOUNTS_QUERY,
  type GoogleCalendarAccountItem,
  type GoogleCalendarAccountsResponse,
} from "./queries";

/**
 * Cuentas de Google visibles para el usuario (las suyas + la compartida de su empresa) y los
 * ids de los calendarios marcados como seleccionados. Comparte caché de Apollo entre el panel
 * de conexiones y el calendario, así que un toggle actualiza ambos.
 */
export function useGoogleCalendarAccounts(options?: { skip?: boolean }) {
  const { data, loading, refetch } = useQuery<GoogleCalendarAccountsResponse>(
    GOOGLE_CALENDAR_ACCOUNTS_QUERY,
    { skip: options?.skip, fetchPolicy: "cache-and-network" },
  );

  const accounts: GoogleCalendarAccountItem[] = useMemo(
    () => data?.googleCalendarAccounts ?? [],
    [data?.googleCalendarAccounts],
  );

  // Solo cuentas activas: una revocada no puede leerse hasta que se reconecte.
  const selectedSelectionIds = useMemo(
    () =>
      accounts
        .filter((a) => a.isActive)
        .flatMap((a) => a.calendars.filter((c) => c.isSelected).map((c) => c.id)),
    [accounts],
  );

  return { accounts, selectedSelectionIds, loading, refetch };
}
