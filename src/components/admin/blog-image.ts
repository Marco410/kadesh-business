const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** null si el archivo sirve como portada. */
export function imageFileError(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return "Usa una imagen JPG, PNG, WEBP o GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "La imagen debe pesar menos de 8 MB.";
  }
  return null;
}
