/**
 * Identidad legal pública (NAP) para el sitio.
 * Debe coincidir con lo declarado en Meta Business / verificación de marca
 * y con el aviso de privacidad. Soporte por WhatsApp sigue en `support.ts`.
 */
export const KADESH_LEGAL = {
  legalName: "Marco Antonio Castañeda Pascual",
  brandName: "Kadesh",
  phoneDisplay: "+52 33 2164 8537",
  phoneE164: "+523321648537",
  tel: "tel:+523321648537",
  email: "contacto@kadesh.com.mx",
  /** Como en Constancia de Situación Fiscal (tipo de vialidad + nombre + número). */
  streetAddress: "Andador Antonia Morelos 163",
  addressLocality: "Morelia",
  addressRegion: "Michoacán de Ocampo",
  postalCode: "58088",
  addressCountry: "MX",
  /** Colonia / asentamiento (no va en PostalAddress schema como campo estándar). */
  neighborhood: "Juana Pavón Infonavit",
} as const;

/** Una línea legible para pie, contacto y privacidad. */
export function formatKadeshLegalAddress(opts?: {
  includeCountry?: boolean;
}): string {
  const includeCountry = opts?.includeCountry ?? true;
  const base = `${KADESH_LEGAL.streetAddress}, ${KADESH_LEGAL.neighborhood}, C.P. ${KADESH_LEGAL.postalCode}, ${KADESH_LEGAL.addressLocality}, ${KADESH_LEGAL.addressRegion}`;
  return includeCountry ? `${base}, México` : base;
}
