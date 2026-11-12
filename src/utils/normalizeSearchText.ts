/**
 * Texto para buscar sin distinguir mayúsculas ni acentos: minúsculas, sin diacríticos
 * (á → a, ü → u, ñ → n) y con los espacios seguidos reducidos a uno.
 *
 * Es copia de `utils/helpers/normalizeSearchText.ts` de kadesh-back, que con ella llena los campos
 * de búsqueda (p. ej. `TechBusinessLead.businessNameSearch`). Deben dar el mismo resultado: si
 * cambia una, cambia la otra (y en el back hay que volver a correr el backfill).
 */
export function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
