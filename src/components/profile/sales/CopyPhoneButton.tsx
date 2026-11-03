"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, Copy01Icon } from "@hugeicons/core-free-icons";

/** Copia el teléfono visible. El estado de “copiado” vive en cada botón. */
export function CopyPhoneButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-dash-faint transition-colors hover:bg-dash-hover hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-[#777]"
      aria-label={copied ? "Teléfono copiado" : "Copiar teléfono"}
      title={copied ? "Copiado" : "Copiar teléfono"}
    >
      <HugeiconsIcon
        icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
        className={`size-3.5 ${copied ? "text-emerald-500" : ""}`}
      />
    </button>
  );
}
