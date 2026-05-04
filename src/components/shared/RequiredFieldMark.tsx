/** Asterisco visual para etiquetas de campos obligatorios (alineado con Autocomplete). */
export default function RequiredFieldMark() {
  return (
    <span className="text-red-500" aria-hidden="true">
      *
    </span>
  );
}
