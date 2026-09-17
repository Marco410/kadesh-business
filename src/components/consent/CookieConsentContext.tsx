"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CookieConsentStatus = "pending" | "accepted" | "rejected";

const COOKIE_CONSENT_STORAGE_KEY = "kadesh-cookie-consent";

function readStoredConsent(): CookieConsentStatus {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === "accepted" || raw === "rejected") return raw;
    return "pending";
  } catch {
    return "pending";
  }
}

function persistConsent(status: "accepted" | "rejected"): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, status);
  } catch {
    /* ignore quota / private mode */
  }
}

interface CookieConsentContextValue {
  status: CookieConsentStatus;
  accept: () => void;
  reject: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<CookieConsentStatus>("pending");

  useEffect(() => {
    setStatus(readStoredConsent());
  }, []);

  const accept = () => {
    persistConsent("accepted");
    setStatus("accepted");
  };

  const reject = () => {
    persistConsent("rejected");
    setStatus("rejected");
  };

  return (
    <CookieConsentContext.Provider value={{ status, accept, reject }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider",
    );
  }
  return ctx;
}
