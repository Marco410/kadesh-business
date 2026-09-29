"use client";

import { useEffect } from "react";
import { useCookieConsent } from "./CookieConsentContext";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Aplica Consent Mode según la decisión del banner.
 * El base code vive en `layout.tsx` (HTML inicial) para que Meta lo detecte
 * al pegar la URL en Test Events / Event Setup Tool.
 */
export function MetaPixelLoader() {
  const { status } = useCookieConsent();

  useEffect(() => {
    const fbq = window.fbq;
    if (typeof fbq !== "function") return;
    fbq("consent", status === "accepted" ? "grant" : "revoke");
  }, [status]);

  return null;
}
