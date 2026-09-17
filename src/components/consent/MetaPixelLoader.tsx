"use client";

import { useEffect } from "react";
import { useCookieConsent } from "./CookieConsentContext";

const META_PIXEL_ID = "1093441746302298";

let metaPixelInjected = false;

function injectMetaPixel(): void {
  if (metaPixelInjected) return;
  metaPixelInjected = true;

  const script = document.createElement("script");
  script.id = "facebook-pixel";
  script.textContent = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

export function MetaPixelLoader() {
  const { status } = useCookieConsent();

  useEffect(() => {
    if (status === "accepted") {
      injectMetaPixel();
    }
  }, [status]);

  return null;
}
