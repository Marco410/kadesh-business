"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { adminErrorText } from "../errors";
import {
  AdminButton,
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  adminInputClass,
  adminLabelClass,
  adminTextareaClass,
} from "../ui";
import { centsToInput, inputToCents, inputToInt } from "./constants";
import {
  ADMIN_STORE_SETTINGS_QUERY,
  CREATE_ADMIN_STORE_SETTINGS_MUTATION,
  UPDATE_ADMIN_STORE_SETTINGS_MUTATION,
  type AdminStoreSettings,
} from "./order-queries";

/** What the backend uses while nobody has saved the settings (`STORE_SETTINGS_DEFAULTS` there). */
const DEFAULTS = {
  shippingFlatCents: 9900,
  freeShippingMinCents: 79900,
  transferExpiryHours: 48,
  cardExpiryMinutes: 60,
};

type FormState = {
  shippingFlat: string;
  freeShippingMin: string;
  cardEnabled: boolean;
  transferEnabled: boolean;
  bankName: string;
  bankBeneficiary: string;
  bankClabe: string;
  bankNote: string;
  transferExpiryHours: string;
  cardExpiryMinutes: string;
  returnPolicy: string;
  supportWhatsapp: string;
};

function initialForm(settings: AdminStoreSettings | null): FormState {
  return {
    shippingFlat: centsToInput(settings?.shippingFlatCents ?? DEFAULTS.shippingFlatCents),
    freeShippingMin: centsToInput(settings ? settings.freeShippingMinCents ?? 0 : DEFAULTS.freeShippingMinCents),
    cardEnabled: settings ? settings.cardEnabled !== false : true,
    transferEnabled: settings ? settings.transferEnabled !== false : true,
    bankName: settings?.bankName ?? "",
    bankBeneficiary: settings?.bankBeneficiary ?? "",
    bankClabe: settings?.bankClabe ?? "",
    bankNote: settings?.bankNote ?? "",
    transferExpiryHours: String(settings?.transferExpiryHours ?? DEFAULTS.transferExpiryHours),
    cardExpiryMinutes: String(settings?.cardExpiryMinutes ?? DEFAULTS.cardExpiryMinutes),
    returnPolicy: settings?.returnPolicy ?? "",
    supportWhatsapp: settings?.supportWhatsapp ?? "",
  };
}

/**
 * Tienda → Ajustes: shipping, payment methods and the bank account for transfers. Changes apply
 * within a minute, without a deploy. Whether the store is open at all is a server variable
 * (`STORE_ENABLED`), not a setting.
 */
export default function AdminStoreSettingsPanel() {
  const { data, loading, error } = useQuery<{ storeSettings: AdminStoreSettings | null }>(ADMIN_STORE_SETTINGS_QUERY, {
    fetchPolicy: "network-only",
  });

  if (error) return <AdminErrorState message={adminErrorText(error, "No se pudieron cargar los ajustes.")} />;
  if (loading && !data) return <AdminLoadingRows rows={5} />;
  return <SettingsForm key={data?.storeSettings?.id ?? "new"} settings={data?.storeSettings ?? null} />;
}

function SettingsForm({ settings }: { settings: AdminStoreSettings | null }) {
  const [form, setForm] = useState<FormState>(() => initialForm(settings));
  const [exists, setExists] = useState(Boolean(settings));
  const [saving, setSaving] = useState(false);
  const [createSettings] = useMutation(CREATE_ADMIN_STORE_SETTINGS_MUTATION);
  const [updateSettings] = useMutation(UPDATE_ADMIN_STORE_SETTINGS_MUTATION);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const shippingFlatCents = inputToCents(form.shippingFlat);
    if (shippingFlatCents === null || Number.isNaN(shippingFlatCents)) {
      return void sileo.warning({ title: "Escribe el costo del envío (0 si es gratis siempre)." });
    }
    const freeShippingMinCents = inputToCents(form.freeShippingMin);
    if (Number.isNaN(freeShippingMinCents)) return void sileo.warning({ title: "El monto para envío gratis no es válido." });
    const transferExpiryHours = inputToInt(form.transferExpiryHours);
    if (!transferExpiryHours || Number.isNaN(transferExpiryHours) || transferExpiryHours > 240) {
      return void sileo.warning({ title: "Las horas para transferir deben ir de 1 a 240." });
    }
    const cardExpiryMinutes = inputToInt(form.cardExpiryMinutes);
    if (!cardExpiryMinutes || Number.isNaN(cardExpiryMinutes) || cardExpiryMinutes < 10 || cardExpiryMinutes > 1440) {
      return void sileo.warning({ title: "Los minutos para pagar con tarjeta deben ir de 10 a 1440." });
    }
    const clabe = form.bankClabe.replace(/\D/g, "");
    if (form.transferEnabled && clabe.length !== 18) {
      return void sileo.warning({
        title: "La CLABE debe tener 18 dígitos.",
        description: "Sin CLABE y beneficiario la transferencia no se ofrece en el checkout.",
      });
    }
    if (form.transferEnabled && !form.bankBeneficiary.trim()) {
      return void sileo.warning({ title: "Escribe el beneficiario de la cuenta." });
    }
    const whatsapp = form.supportWhatsapp.replace(/\D/g, "");
    if (whatsapp && whatsapp.length !== 10) return void sileo.warning({ title: "El WhatsApp de soporte debe tener 10 dígitos." });

    const payload = {
      shippingFlatCents,
      freeShippingMinCents: freeShippingMinCents ?? 0,
      cardEnabled: form.cardEnabled,
      transferEnabled: form.transferEnabled,
      bankName: form.bankName.trim(),
      bankBeneficiary: form.bankBeneficiary.trim(),
      bankClabe: clabe,
      bankNote: form.bankNote.trim(),
      transferExpiryHours,
      cardExpiryMinutes,
      returnPolicy: form.returnPolicy.trim(),
      supportWhatsapp: whatsapp,
    };

    setSaving(true);
    try {
      await (exists ? updateSettings : createSettings)({ variables: { data: payload } });
      setExists(true);
      sileo.success({ title: "Ajustes guardados", description: "Aplican en la tienda en menos de un minuto." });
    } catch (err) {
      sileo.error({ title: "No se pudieron guardar los ajustes", description: adminErrorText(err, "Intenta de nuevo.") });
    } finally {
      setSaving(false);
    }
  }

  const grid = "grid grid-cols-1 gap-4 sm:grid-cols-2";
  const check = "inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px] text-dash-ink";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-4">
      {!exists ? (
        <p className="rounded-2xl bg-dash-surface-2 px-4 py-3 text-sm text-dash-soft">
          Nadie ha guardado los ajustes todavía: la tienda usa los valores que ves aquí. La transferencia no se ofrece
          hasta que guardes los datos del banco.
        </p>
      ) : null}

      <AdminSectionCard title="Envío" description="Una tarifa por pedido, sin importar cuántos productos lleve.">
        <div className={grid}>
          <label className="block">
            <span className={adminLabelClass}>Costo del envío</span>
            <input value={form.shippingFlat} onChange={(event) => set("shippingFlat", event.target.value)} className={adminInputClass} inputMode="decimal" />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Envío gratis desde</span>
            <input value={form.freeShippingMin} onChange={(event) => set("freeShippingMin", event.target.value)} className={adminInputClass} inputMode="decimal" />
            <span className="mt-1 block text-xs text-dash-faint">Subtotal del pedido. Vacío o 0 = nunca es gratis.</span>
          </label>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Formas de pago" index={1}>
        <div className="flex flex-col gap-4">
          <label className={check}>
            <input type="checkbox" checked={form.cardEnabled} onChange={(event) => set("cardEnabled", event.target.checked)} className="size-4 accent-orange-500" />
            Tarjeta (Stripe)
          </label>
          <label className="block sm:max-w-xs">
            <span className={adminLabelClass}>Minutos para pagar con tarjeta</span>
            <input value={form.cardExpiryMinutes} onChange={(event) => set("cardExpiryMinutes", event.target.value)} className={adminInputClass} inputMode="numeric" />
            <span className="mt-1 block text-xs text-dash-faint">Sin pago en ese tiempo, el pedido se cancela y el stock regresa.</span>
          </label>
          <label className={check}>
            <input type="checkbox" checked={form.transferEnabled} onChange={(event) => set("transferEnabled", event.target.checked)} className="size-4 accent-orange-500" />
            Transferencia con comprobante
          </label>
          <div className={grid}>
            <label className="block">
              <span className={adminLabelClass}>Banco</span>
              <input value={form.bankName} onChange={(event) => set("bankName", event.target.value)} className={adminInputClass} />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Beneficiario</span>
              <input value={form.bankBeneficiary} onChange={(event) => set("bankBeneficiary", event.target.value)} className={adminInputClass} />
            </label>
            <label className="block">
              <span className={adminLabelClass}>CLABE</span>
              <input value={form.bankClabe} onChange={(event) => set("bankClabe", event.target.value)} className={adminInputClass} inputMode="numeric" maxLength={22} />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Horas para transferir</span>
              <input value={form.transferExpiryHours} onChange={(event) => set("transferExpiryHours", event.target.value)} className={adminInputClass} inputMode="numeric" />
            </label>
          </div>
          <label className="block">
            <span className={adminLabelClass}>Indicaciones para quien transfiere (opcional)</span>
            <textarea value={form.bankNote} onChange={(event) => set("bankNote", event.target.value)} className={adminTextareaClass} maxLength={500} />
          </label>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Atención" index={2}>
        <div className="flex flex-col gap-4">
          <label className="block sm:max-w-xs">
            <span className={adminLabelClass}>WhatsApp de soporte</span>
            <input value={form.supportWhatsapp} onChange={(event) => set("supportWhatsapp", event.target.value)} className={adminInputClass} inputMode="tel" placeholder="10 dígitos" />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Política de cambios y devoluciones</span>
            <textarea
              value={form.returnPolicy}
              onChange={(event) => set("returnPolicy", event.target.value)}
              className={`${adminTextareaClass} min-h-36`}
              maxLength={3000}
            />
            <span className="mt-1 block text-xs text-dash-faint">Se muestra en el checkout y en cada pedido.</span>
          </label>
        </div>
      </AdminSectionCard>

      <AdminButton type="submit" disabled={saving} className="self-start">
        {saving ? "Guardando…" : "Guardar ajustes"}
      </AdminButton>
    </form>
  );
}
