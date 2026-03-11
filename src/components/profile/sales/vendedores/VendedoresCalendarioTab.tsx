"use client";

import VendedoresCalendar from "./VendedoresCalendar";

export interface VendedoresCalendarioTabProps {
  userId: string;
}

/**
 * Pestaña Calendario: muestra actividades, propuestas y seguimientos de todos los vendedores de la empresa.
 */
export default function VendedoresCalendarioTab({ userId }: VendedoresCalendarioTabProps) {
  return <VendedoresCalendar userId={userId} />;
}
