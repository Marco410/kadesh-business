"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  CheckmarkCircle01Icon,
  Link01Icon,
  UserAdd01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { USER_COMPANY_CATEGORIES_QUERY } from "kadesh/components/profile/sales/queries";
import {
  UPDATE_USER_MUTATION,
  type UpdateUserResponse,
  type UpdateUserVariables,
} from "kadesh/utils/queries";
import { sileo } from "sileo";

export interface ReferralLinkSectionProps {
  userId: string;
  referralCode: string;
  bank: string | null | undefined;
  clabe: string | null | undefined;
  cardNumber: string | null | undefined;
}

const REFERRAL_DESCRIPTION =
  "Comparte tu enlace y gana comisiones por cada negocio que se registre con tu código.";

function hasCompletePayout(
  bank: string | null | undefined,
  clabe: string | null | undefined,
  cardNumber: string | null | undefined
): boolean {
  const b = (bank ?? "").trim();
  const c = (clabe ?? "").trim();
  const n = (cardNumber ?? "").trim();
  return Boolean(b && (c || n));
}

export default function ReferralLinkSection({
  userId,
  referralCode,
  bank,
  clabe,
  cardNumber,
}: ReferralLinkSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formBank, setFormBank] = useState("");
  const [formClabe, setFormClabe] = useState("");
  const [formCardNumber, setFormCardNumber] = useState("");

  const payoutComplete = useMemo(
    () => hasCompletePayout(bank, clabe, cardNumber),
    [bank, clabe, cardNumber]
  );

  const syncFormFromProps = useCallback(() => {
    setFormBank((bank ?? "").trim());
    setFormClabe((clabe ?? "").trim());
    setFormCardNumber((cardNumber ?? "").trim());
  }, [bank, clabe, cardNumber]);

  useEffect(() => {
    if (!isEditing) {
      syncFormFromProps();
    }
  }, [isEditing, syncFormFromProps]);

  const [updateUser, { loading: saving }] = useMutation<
    UpdateUserResponse,
    UpdateUserVariables
  >(UPDATE_USER_MUTATION, {
    refetchQueries: [
      { query: USER_COMPANY_CATEGORIES_QUERY, variables: { where: { id: userId } } },
    ],
  });

  const referralLink = useMemo(() => {
    if (typeof window === "undefined" || !referralCode) return "";
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

  const showForm = !payoutComplete || isEditing;

  const handleStartEdit = () => {
    syncFormFromProps();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    syncFormFromProps();
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const nextBank = formBank.trim();
    const nextClabe = formClabe.trim();
    const nextCard = formCardNumber.trim();

    if (!nextBank) {
      sileo.warning({ title: "Indica el nombre del banco." });
      return;
    }
    if (!nextClabe && !nextCard) {
      sileo.warning({
        title: "Agrega CLABE o número de tarjeta",
        description: "Necesitamos al menos uno de los dos para pagos de comisión.",
      });
      return;
    }

    try {
      await updateUser({
        variables: {
          where: { id: userId },
          data: {
            bank: nextBank,
            clabe: nextClabe || null,
            cardNumber: nextCard || null,
          },
        },
      });
      sileo.success({ title: "Datos de pago guardados" });
      setIsEditing(false);
    } catch (err) {
      sileo.error({
        title: "No se pudieron guardar los datos",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-[#fafafa] dark:bg-[#0f0f0f] px-3 py-2 text-sm text-[#171717] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50";

  return (
    <div className="w-full rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-sm overflow-hidden">
      <header className="flex items-start gap-4 px-5 sm:px-6 py-5 border-b border-[#f0f0f0] dark:border-[#2a2a2a]">
        <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
          <HugeiconsIcon icon={UserAdd01Icon} size={24} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h3 className="text-lg font-bold tracking-tight text-[#212121] dark:text-white">
            Programa de referidos
          </h3>
          <p
            title={REFERRAL_DESCRIPTION}
            className="mt-1 text-sm text-[#616161] dark:text-[#a3a3a3] leading-relaxed line-clamp-3"
          >
            {REFERRAL_DESCRIPTION}
          </p>
        </div>
      </header>

      <div className="px-5 sm:px-6 py-5">
        {showForm && (
            <div>
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Datos para comisiones
              </p>
              <p className="mt-1 text-xs text-[#737373] dark:text-[#8a8a8a] leading-relaxed">
                Completa banco y CLABE o tarjeta para ver tu código y enlace de invitación.
              </p>
              <form onSubmit={handleSavePayout} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="referral-payout-bank" className="block text-xs font-medium text-[#404040] dark:text-[#d4d4d4] mb-1.5">
                    Banco <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="referral-payout-bank"
                    type="text"
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    autoComplete="organization"
                    className={inputClass}
                    placeholder="Ej. BBVA, Santander…"
                  />
                </div>
                <div>
                  <label htmlFor="referral-payout-clabe" className="block text-xs font-medium text-[#404040] dark:text-[#d4d4d4] mb-1.5">
                    CLABE
                  </label>
                  <input
                    id="referral-payout-clabe"
                    type="text"
                    inputMode="numeric"
                    value={formClabe}
                    onChange={(e) => setFormClabe(e.target.value)}
                    autoComplete="off"
                    className={`${inputClass} font-mono text-[13px]`}
                    placeholder="18 dígitos (opcional)"
                  />
                </div>
                <div>
                  <label htmlFor="referral-payout-card" className="block text-xs font-medium text-[#404040] dark:text-[#d4d4d4] mb-1.5">
                    Tarjeta
                  </label>
                  <input
                    id="referral-payout-card"
                    type="text"
                    inputMode="numeric"
                    value={formCardNumber}
                    onChange={(e) => setFormCardNumber(e.target.value)}
                    autoComplete="off"
                    className={`${inputClass} font-mono text-[13px]`}
                    placeholder="Opcional si usas CLABE"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-w-[8rem] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                  {payoutComplete && isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold border border-[#e5e5e5] dark:border-[#404040] text-[#404040] dark:text-[#e5e5e5] hover:bg-[#f5f5f5] dark:hover:bg-[#262626] disabled:opacity-60 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
        )}

        {payoutComplete && !isEditing && (
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-xs font-medium uppercase tracking-wider text-[#616161] dark:text-[#8a8a8a] shrink-0">
                  Tu código
                </span>
                <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-orange-200/80 dark:border-orange-500/25 bg-orange-50 dark:bg-orange-500/10 px-4 py-2">
                  <HugeiconsIcon icon={Link01Icon} size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
                  <span className="text-base font-mono font-bold tracking-widest text-orange-700 dark:text-orange-300 truncate">
                    {referralCode || "—"}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="referral-link" className="block text-xs font-medium text-[#404040] dark:text-[#d4d4d4] mb-1.5">
                  Enlace de registro
                </label>
                <div className="flex gap-2">
                  <input
                    id="referral-link"
                    value={referralLink}
                    readOnly
                    className={`${inputClass} flex-1 min-w-0 text-xs py-2`}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!referralLink}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} size={16} />
                    {copied ? "Listo" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-[#fafafa] dark:bg-[#141414]">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#ebebeb] dark:border-[#333]">
                  <span className="text-xs font-semibold text-[#525252] dark:text-[#a3a3a3]">
                    Datos de pago
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors"
                  >
                    <HugeiconsIcon icon={Edit02Icon} size={14} />
                    Editar
                  </button>
                </div>
                <dl className="divide-y divide-[#ebebeb] dark:divide-[#333]">
                  <div className="px-4 py-2.5 flex justify-between gap-3 text-sm">
                    <dt className="text-[#737373] dark:text-[#8a8a8a] shrink-0">Banco</dt>
                    <dd className="font-medium text-[#171717] dark:text-white text-right break-words">
                      {(bank ?? "").trim() || "—"}
                    </dd>
                  </div>
                  {(clabe ?? "").trim() ? (
                    <div className="px-4 py-2.5 flex justify-between gap-3 text-sm">
                      <dt className="text-[#737373] dark:text-[#8a8a8a] shrink-0">CLABE</dt>
                      <dd className="font-mono text-xs text-[#171717] dark:text-[#e5e5e5] text-right break-all">
                        {(clabe ?? "").trim()}
                      </dd>
                    </div>
                  ) : null}
                  {(cardNumber ?? "").trim() ? (
                    <div className="px-4 py-2.5 flex justify-between gap-3 text-sm">
                      <dt className="text-[#737373] dark:text-[#8a8a8a] shrink-0">Tarjeta</dt>
                      <dd className="font-mono text-xs text-[#171717] dark:text-[#e5e5e5] text-right break-all">
                        {(cardNumber ?? "").trim()}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
