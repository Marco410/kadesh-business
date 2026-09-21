"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { CookieIcon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { useCookieConsent } from "./CookieConsentContext";

export function CookieConsentBanner() {
  const { status, accept, reject } = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== "pending") return null;

  const banner = (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimiento de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e0e0e0] bg-[#ffffff] p-4 shadow-lg dark:border-[#3a3a3a] dark:bg-[#121212] sm:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <HugeiconsIcon
            icon={CookieIcon}
            size={24}
            className="mt-0.5 shrink-0 text-orange-500"
          />
          <p className="text-sm text-[#212121] dark:text-[#ffffff]">
            Usamos cookies para analizar el uso del sitio y mejorar tu
            experiencia.{" "}
            <Link
              href={Routes.privacy}
              className="underline underline-offset-2 hover:text-orange-500"
            >
              Conoce nuestra política de privacidad
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={reject}
            className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#ffffff] dark:hover:bg-[#1a1a1a]"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(banner, document.body);
}
