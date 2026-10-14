// AdSense lee /ads.txt en el dominio raíz (kadesh.com.mx); este archivo autoriza también los anuncios de pet.kadesh.com.mx.
import { ADSENSE_CLIENT } from 'kadesh/core/ads';

export const dynamic = 'force-static';

export function GET() {
  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, '');
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
