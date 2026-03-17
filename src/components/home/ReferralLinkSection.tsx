"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, CheckmarkCircle01Icon, Link01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";

interface ReferralLinkSectionProps {
  referralCode: string;
}

export default function ReferralLinkSection({ referralCode }: ReferralLinkSectionProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${Routes.auth.registerWithReferral(referralCode)}`;
  }, [referralCode]);

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-orange-200/60 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-[#1e1e1e] p-6 sm:p-8 shadow-sm overflow-hidden relative">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-orange-400/10 dark:bg-orange-500/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Icon */}
        <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 text-orange-500">
          <HugeiconsIcon icon={UserAdd01Icon} size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-[#212121] dark:text-white leading-tight">
            Programa de referidos
          </h3>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e]">
            Comparte tu enlace y gana comisiones por cada negocio que se registre con tu código.
          </p>

          {/* Code badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 px-3 py-1.5">
            <HugeiconsIcon icon={Link01Icon} size={13} className="text-orange-500 shrink-0" />
            <span className="text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 tracking-wide">
              {referralCode}
            </span>
          </div>

          {/* Link input + copy */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 min-w-0">
              <label className="sr-only" htmlFor="referral-link">
                Enlace de referido
              </label>
              <input
                id="referral-link"
                value={referralLink}
                readOnly
                className="w-full rounded-xl border border-[#e0e0e0] dark:border-[#333] bg-white dark:bg-[#121212] px-3.5 py-2.5 text-xs text-[#424242] dark:text-[#bdbdbd] font-mono truncate focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 shrink-0 ${
                copied
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-95"
              }`}
            >
              <HugeiconsIcon
                icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
                size={15}
              />
              {copied ? "Copiado" : "Copiar enlace"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
