"use client";

import { cn } from "kadesh/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";
import {
  formatInstallmentMonthsList,
  getEligibleInstallmentMonths,
  isMxnCurrency,
} from "./installments";

interface InstallmentsNoticeProps {
  amount: number;
  currency: string;
  className?: string;
  variant?: "default" | "compact";
}

export default function InstallmentsNotice({
  amount,
  currency,
  className,
  variant = "default",
}: InstallmentsNoticeProps) {
  if (!isMxnCurrency(currency)) return null;

  const eligibleMonths = getEligibleInstallmentMonths(amount, currency);
  const monthsLabel = formatInstallmentMonthsList(eligibleMonths);

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-xl border border-orange-200/80 bg-orange-50/80 dark:border-orange-500/30 dark:bg-orange-500/10",
        isCompact ? "p-3" : "p-4",
        className,
      )}
      role="note"
    >
      <div className="flex gap-3">
        <HugeiconsIcon
          icon={CreditCardIcon}
          size={isCompact ? 18 : 20}
          className="mt-0.5 flex-shrink-0 text-orange-600 dark:text-orange-400"
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              "font-semibold text-[#212121] dark:text-[#e8e8e8]",
              isCompact ? "text-xs" : "text-sm",
            )}
          >
            Meses sin intereses disponibles
          </p>
          {eligibleMonths.length > 0 ? (
            <p
              className={cn(
                "text-[#616161] dark:text-[#b0b0b0]",
                isCompact ? "text-xs" : "text-sm",
              )}
            >
              Con tarjetas de crédito mexicanas participantes puedes pagar a{" "}
              <strong className="font-medium text-[#212121] dark:text-[#e0e0e0]">
                {monthsLabel}
              </strong>{" "}
              sin intereses, según tu banco y el monto del plan.
            </p>
          ) : (
            <p
              className={cn(
                "text-[#616161] dark:text-[#b0b0b0]",
                isCompact ? "text-xs" : "text-sm",
              )}
            >
              Aceptamos meses sin intereses con tarjetas de crédito mexicanas
              participantes cuando el monto cumple los mínimos de cada plazo.
            </p>
          )}
          {!isCompact && (
            <p className="text-xs text-[#757575] dark:text-[#999]">
              Después de ingresar tu tarjeta en el formulario de pago, elige el
              plazo si tu banco lo ofrece (tarjeta de crédito mexicana, monto en
              MXN).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
