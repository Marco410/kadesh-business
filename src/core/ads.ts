/**
 * Editor de AdSense de KADESH (kadesh.com.mx y pet.kadesh.com.mx). Es público (va en el HTML de cada página),
 * así que vive aquí como valor por defecto; NEXT_PUBLIC_ADSENSE_CLIENT lo puede cambiar.
 */
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-5261090590772430';

/** Bloque de AdSense del blog (opcional). Sin él, el bloque muestra anuncios propios de KADESH. */
export const BLOG_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG;

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
