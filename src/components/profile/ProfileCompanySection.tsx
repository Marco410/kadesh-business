"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, Edit01Icon } from "@hugeicons/core-free-icons";
import {
  PROFILE_USER_COMPANY_QUERY,
  UPDATE_SAAS_COMPANY_MUTATION,
  type ProfileUserCompanyResponse,
  type ProfileUserCompanyVariables,
  type UpdateSaasCompanyResponse,
  type UpdateSaasCompanyVariables,
} from "kadesh/utils/queries";
import { Routes } from "kadesh/core/routes";

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed";

const TEXTAREA_CLASS =
  "w-full min-h-[100px] px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-y";

const COMPANY_LOGO_PX = 500;

async function validateCompanyLogoDimensions(
  file: File,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    if (width !== COMPANY_LOGO_PX || height !== COMPANY_LOGO_PX) {
      return {
        ok: false,
        message: `El logo debe medir exactamente ${COMPANY_LOGO_PX}×${COMPANY_LOGO_PX} px \n(tu archivo mide: ${width}×${height} px).`,
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "No se pudo leer la imagen. Prueba con JPG, PNG o WebP.",
    };
  }
}

interface SaveChangesButtonProps {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  label?: string;
  savingLabel?: string;
}

function SaveChangesButton({
  isDirty,
  saving,
  onSave,
  label = "Guardar cambios",
  savingLabel = "Guardando...",
}: SaveChangesButtonProps) {
  if (!isDirty) return null;
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
    >
      {saving ? (
        <>
          <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
          {savingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export interface ProfileCompanySectionProps {
  userId: string;
}

export default function ProfileCompanySection({
  userId,
}: ProfileCompanySectionProps) {
  const { data, loading, refetch } = useQuery<
    ProfileUserCompanyResponse,
    ProfileUserCompanyVariables
  >(PROFILE_USER_COMPANY_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const savedCompany = data?.user?.company ?? null;

  const [companyName, setCompanyName] = useState("");
  const [termsQuotation, settermsQuotation] = useState("");
  const [onboardingMainOffer, setOnboardingMainOffer] = useState("");
  const [onboardingIdealCustomer, setOnboardingIdealCustomer] = useState("");
  const [onboardingAvgTicketValue, setOnboardingAvgTicketValue] = useState("");
  const [onboardingSalesPain, setOnboardingSalesPain] = useState("");
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoError, setCompanyLogoError] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!companyLogoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(companyLogoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [companyLogoFile]);

  useEffect(() => {
    if (!savedCompany) {
      setCompanyName("");
      settermsQuotation("");
      setOnboardingMainOffer("");
      setOnboardingIdealCustomer("");
      setOnboardingAvgTicketValue("");
      setOnboardingSalesPain("");
      setCompanyLogoFile(null);
      setCompanyLogoError("");
      return;
    }
    setCompanyName(savedCompany.name ?? "");
    settermsQuotation(savedCompany.termsQuotation ?? "");
    setOnboardingMainOffer(savedCompany.onboardingMainOffer ?? "");
    setOnboardingIdealCustomer(savedCompany.onboardingIdealCustomer ?? "");
    setOnboardingAvgTicketValue(savedCompany.onboardingAvgTicketValue ?? "");
    setOnboardingSalesPain(savedCompany.onboardingSalesPain ?? "");
    setCompanyLogoFile(null);
    setCompanyLogoError("");
  }, [
    savedCompany?.id,
    savedCompany?.name,
    savedCompany?.termsQuotation,
    savedCompany?.onboardingMainOffer,
    savedCompany?.onboardingIdealCustomer,
    savedCompany?.onboardingAvgTicketValue,
    savedCompany?.onboardingSalesPain,
    savedCompany?.logo?.url,
  ]);

  const isCompanyDirty = Boolean(
    savedCompany &&
      (companyName.trim() !== (savedCompany.name ?? "").trim() || 
        (termsQuotation || "") !==
          (savedCompany.termsQuotation ?? "") ||
        (onboardingMainOffer || "") !==
          (savedCompany.onboardingMainOffer ?? "") ||
        (onboardingIdealCustomer || "") !==
          (savedCompany.onboardingIdealCustomer ?? "") ||
        (onboardingAvgTicketValue || "") !==
          (savedCompany.onboardingAvgTicketValue ?? "") ||
        (onboardingSalesPain || "") !==
          (savedCompany.onboardingSalesPain ?? "") ||
        companyLogoFile !== null),
  );

  const [companySaveError, setCompanySaveError] = useState("");

  const [updateCompany, { loading: savingCompany }] = useMutation<
    UpdateSaasCompanyResponse,
    UpdateSaasCompanyVariables
  >(UPDATE_SAAS_COMPANY_MUTATION, {
    onCompleted: async () => {
      setCompanySaveError("");
      setCompanyLogoFile(null);
      await refetch();
    },
    onError: () => {
      setCompanySaveError("No se pudo guardar la empresa. Intenta de nuevo.");
    },
  });

  const handleCompanyLogoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      if (file && !file.type.startsWith("image/")) {
        setCompanyLogoError("Usa una imagen (JPG, PNG, WebP, etc.).");
      }
      input.value = "";
      return;
    }
    setCompanyLogoError("");
    void (async () => {
      const result = await validateCompanyLogoDimensions(file);
      if (!result.ok) {
        setCompanyLogoError(result.message);
        input.value = "";
        return;
      }
      setCompanyLogoFile(file);
      input.value = "";
    })();
  };

  const handleSaveCompany = async () => {
    if (!savedCompany?.id || !isCompanyDirty) return;
    const trimmedName = companyName.trim();
    if (!trimmedName) {
      setCompanySaveError("El nombre de la empresa es obligatorio.");
      return;
    }
    setCompanySaveError("");
    await updateCompany({
      variables: {
        where: { id: savedCompany.id },
        data: {
          name: trimmedName,
          onboardingMainOffer: onboardingMainOffer.trim() || null,
          onboardingIdealCustomer: onboardingIdealCustomer.trim() || null,
          onboardingAvgTicketValue: onboardingAvgTicketValue.trim() || null,
          onboardingSalesPain: onboardingSalesPain.trim() || null,
          termsQuotation: termsQuotation.trim() || null,
          ...(companyLogoFile ? { logo: { upload: companyLogoFile } } : {}),
        },
      },
    });
  };

  const companyLogoDisplayUrl =
    logoPreviewUrl ?? savedCompany?.logo?.url ?? null;

  if (loading && !data?.user) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-md dark:shadow-lg">
        <div className="flex items-center justify-center py-12">
          <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-md dark:shadow-lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Información de la empresa
        </h2>
        <SaveChangesButton
          isDirty={isCompanyDirty}
          saving={savingCompany}
          onSave={handleSaveCompany}
          label="Guardar empresa"
          savingLabel="Guardando..."
        />
      </div>

      {companySaveError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
          {companySaveError}
        </div>
      )}

      {!savedCompany ? (
        <p className="text-[#616161] dark:text-[#b0b0b0] text-sm">
          No hay una empresa vinculada a tu cuenta. Si acabas de registrarte,
          recarga la página. Si el problema continúa, escríbenos en{" "}
          <Link
            href={Routes.contact}
            className="text-orange-500 dark:text-orange-400 hover:underline font-medium"
          >
            contacto
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            <div className="flex flex-col items-start gap-1">
              <input
                ref={companyLogoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Subir logo de la empresa"
                onChange={handleCompanyLogoPick}
              />
              <button
                type="button"
                onClick={() => companyLogoInputRef.current?.click()}
                className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-2 border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#2a2a2a] flex items-center justify-center overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e]"
              >
                {companyLogoDisplayUrl ? (
                  <Image
                    src={companyLogoDisplayUrl}
                    alt="Logo de la empresa"
                    fill
                    className="object-contain p-1"
                    unoptimized={Boolean(logoPreviewUrl)}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Edit01Icon}
                    className="size-8 text-[#9ca3af]"
                  />
                )}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-1 right-1 rounded-md bg-white/90 dark:bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <HugeiconsIcon
                    icon={Edit01Icon}
                    className="size-4 text-[#212121] dark:text-white"
                  />
                </span>
              </button>
              {companyLogoError && (
                <p className="text-sm text-red-600 dark:text-red-400 max-w-xs">
                  {companyLogoError}
                </p>
              )}
            </div>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] sm:pt-1">
              Solo imágenes de {COMPANY_LOGO_PX}×{COMPANY_LOGO_PX} px (cuadrado).
              Se guarda al pulsar &quot;Guardar empresa&quot;. PNG o JPG recomendado.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
              Nombre de la empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nombre comercial o razón social"
              className={INPUT_CLASS}
              required
            />
            <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
              Nombre de la compañía u organización.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
              />
              Términos y condiciones en la cotización
            </label>
            <textarea
              value={termsQuotation}
              onChange={(e) => settermsQuotation(e.target.value)}
              placeholder="Estos terminos y condiciones se mostrarán en la cotización para el cliente. Se pueden editar en cada cotización."
              className={TEXTAREA_CLASS}
              rows={3}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">Información</h3>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mb-5">
              Esta información se usará para personalizar el onboarding de tus clientes en una futura versión de Kadesh.
            </p>
            <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
              />
              El &quot;Qué&quot; — Oferta principal
            </label>
            <textarea
              value={onboardingMainOffer}
              onChange={(e) => setOnboardingMainOffer(e.target.value)}
              placeholder="En una o dos oraciones: ¿qué servicio o producto principal vendes?"
              className={TEXTAREA_CLASS}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
              />
              El &quot;Quién&quot; — Cliente ideal
            </label>
            <textarea
              value={onboardingIdealCustomer}
              onChange={(e) => setOnboardingIdealCustomer(e.target.value)}
              placeholder="Ej. clínicas dentales, constructoras, restaurantes…"
              className={TEXTAREA_CLASS}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
              />
              El &quot;Cuánto&quot; — Ticket o valor
            </label>
            <textarea
              value={onboardingAvgTicketValue}
              onChange={(e) => setOnboardingAvgTicketValue(e.target.value)}
              placeholder="Precio promedio, o cuánto ayudas a ganar o ahorrar a tus clientes"
              className={TEXTAREA_CLASS}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
              />
              El &quot;Cómo&quot; — Adquisición y dolores al vender
            </label>
            <textarea
              value={onboardingSalesPain}
              onChange={(e) => setOnboardingSalesPain(e.target.value)}
              placeholder="¿Cómo consigues clientes hoy y qué te cuesta más al vender?"
              className={TEXTAREA_CLASS}
              rows={3}
            />
          </div>

          <div className="flex justify-center sm:justify-end pt-2">
            <SaveChangesButton
              isDirty={isCompanyDirty}
              saving={savingCompany}
              onSave={handleSaveCompany}
              label="Guardar empresa"
              savingLabel="Guardando..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
