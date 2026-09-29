/** Clave compartida: layout (SSR snippet) + CookieConsentProvider. */
export const COOKIE_CONSENT_STORAGE_KEY = "kadesh-cookie-consent";

/** ID del Meta Pixel (Events Manager). Un solo lugar para layout + loader. */
export const META_PIXEL_ID = "1085575667194114";

/**
 * Snippet base en el HTML inicial.
 * Consent Mode empieza en revoke; si ya hay `accepted` en localStorage, hace grant
 * al instante (sin esperar a React) para que PageView llegue a Test Events.
 */
export function getMetaPixelBaseSnippet(pixelId: string = META_PIXEL_ID): string {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent', 'revoke');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
try{if(localStorage.getItem('${COOKIE_CONSENT_STORAGE_KEY}')==='accepted'){fbq('consent','grant');}}catch(e){}`;
}
