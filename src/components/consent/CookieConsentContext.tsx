"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { COOKIE_CONSENT_STORAGE_KEY } from "./meta-pixel";

export type CookieConsentStatus = "pending" | "accepted" | "rejected";

function readStoredConsent(): CookieConsentStatus {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === "accepted" || raw === "rejected") return raw;
    return "pending";
  } catch {
    return "pending";
  }
}

const consentListeners = new Set<() => void>();

function subscribeConsent(onChange: () => void) {
  consentListeners.add(onChange);
  return () => consentListeners.delete(onChange);
}

function emitConsent() {
  consentListeners.forEach((listener) => listener());
}

function persistConsent(status: "accepted" | "rejected"): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, status);
  } catch {
    /* ignore quota / private mode */
  }
  emitConsent();
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
  const status = useSyncExternalStore(
    subscribeConsent,
    readStoredConsent,
    () => "pending" as CookieConsentStatus,
  );

  const accept = () => {
    persistConsent("accepted");
  };

  const reject = () => {
    persistConsent("rejected");
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
