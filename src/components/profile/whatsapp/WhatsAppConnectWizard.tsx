"use client";

import { useState, type ReactNode } from "react";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  EyeIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  DISCOVER_WHATSAPP_ACCOUNT_MUTATION,
  type CompanyWhatsappSettings,
  type DiscoverWhatsappAccountResponse,
  type DiscoverWhatsappAccountResult,
  type DiscoverWhatsappAccountVariables,
} from "./queries";

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed";

const META_APPS_URL = "https://developers.facebook.com/apps";

/**
 * Instrucciones para reenviar a quien administra el Meta de la empresa (pasos 2 a 5).
 * NO incluyen el Verify Token: Kadesh configura el webhook por API y el token nunca sale
 * escrito en el front.
 */
const TECH_CONTACT_INSTRUCTIONS = `Necesito conectar WhatsApp Business a Kadesh. Te pido estos pasos en Meta:

1. En ${META_APPS_URL} crea una App de tipo "Empresa" y agrégale el producto WhatsApp.
2. En la App: Configuración de la app → Básica. Pásame el "ID de la aplicación" (App ID) y la "Clave secreta de la aplicación" (App Secret, botón Mostrar).
3. En business.facebook.com → Configuración de la empresa → Usuarios del sistema: crea un usuario Admin, asígnale esta App y la cuenta de WhatsApp Business, y genera un token PERMANENTE (sin fecha de expiración) con los DOS permisos: whatsapp_business_messaging y whatsapp_business_management. Pásame el token.
4. Publica la App (arriba en el panel de la App, cambia de "Desarrollo" a "Publicada / Live"). Meta pedirá la URL de una política de privacidad. Sin este paso no llegan los mensajes reales.
5. Agrega un método de pago en la cuenta de WhatsApp Business (Meta lo pide para las plantillas de inicio de conversación).`;

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#212121] dark:text-white">{title}</p>
        <div className="mt-1.5 space-y-3 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          {children}
        </div>
      </div>
    </li>
  );
}

export interface WhatsAppConnectWizardProps {
  companyId: string;
  saved: CompanyWhatsappSettings | null;
  onConnected: () => Promise<unknown> | void;
}

/**
 * Asistente guiado: el usuario pega App ID, App Secret y un token; Kadesh descubre el WABA y
 * el número, configura el webhook por API y crea la plantilla. Publicar la App (modo Live) sigue
 * siendo un paso manual en Meta.
 */
export function WhatsAppConnectWizard({
  companyId,
  saved,
  onConnected,
}: WhatsAppConnectWizardProps) {
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<DiscoverWhatsappAccountResult | null>(null);

  const [discover, { loading }] = useMutation<
    DiscoverWhatsappAccountResponse,
    DiscoverWhatsappAccountVariables
  >(DISCOVER_WHATSAPP_ACCOUNT_MUTATION);

  const isConnected = Boolean(saved?.whatsappConnectedAt);
  const canSubmit = appId.trim() && appSecret.trim() && accessToken.trim();

  const run = async (phoneNumberId?: string) => {
    if (!canSubmit) return;
    setResult(null);
    try {
      const res = await discover({
        variables: {
          input: {
            companyId,
            appId: appId.trim(),
            appSecret: appSecret.trim(),
            accessToken: accessToken.trim(),
            ...(phoneNumberId ? { phoneNumberId } : {}),
          },
        },
      });
      const payload = res.data?.discoverWhatsappAccount;
      if (!payload) return;
      setResult(payload);
      if (payload.needsSelection) return;
      if (payload.success) {
        setAppSecret("");
        setAccessToken("");
        await onConnected();
        sileo.success({ title: `Conectado: ${payload.displayPhoneNumber ?? "WhatsApp"}` });
      } else {
        sileo.error({ title: payload.message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo conectar.";
      setResult({
        success: false,
        message,
        detail: null,
        needsSelection: false,
        phoneOptions: [],
        displayPhoneNumber: null,
        verifiedName: null,
        webhookConfigured: false,
        webhookError: null,
        templateError: null,
      });
      sileo.error({ title: message });
    }
  };

  const copyInstructions = async () => {
    try {
      await navigator.clipboard.writeText(TECH_CONTACT_INSTRUCTIONS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      sileo.error({ title: "No se pudo copiar. Selecciona el texto manualmente." });
    }
  };

  const label = "mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]";

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#212121] dark:text-white">
          {isConnected ? "Reconectar o cambiar de número" : "Conecta tu WhatsApp en 5 pasos"}
        </p>
        <button
          type="button"
          onClick={() => void copyInstructions()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-xs font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
        >
          <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} className="size-3.5" />
          {copied ? "Copiado" : "Copiar instrucciones para mi contacto técnico"}
        </button>
      </div>

      <ol className="mt-4 space-y-6">
        <Step n={1} title="Prepara tu número">
          <p>
            El número no puede seguir activo en la app normal de WhatsApp. Antes, exporta los
            chats que quieras conservar (en el chat: menú → Más → Exportar chat) y súbelos en
            &quot;Importar historial de chats&quot; más abajo.
          </p>
        </Step>

        <Step n={2} title="Crea tu App de Meta">
          <p>
            Entra a{" "}
            <a
              href={META_APPS_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-orange-600 underline dark:text-orange-400"
            >
              developers.facebook.com/apps
            </a>
            , crea una App de tipo <strong>Empresa</strong> y agrégale el producto{" "}
            <strong>WhatsApp</strong>.
          </p>
        </Step>

        <Step n={3} title="Copia el App ID y el App Secret">
          <p>
            En tu App: <strong>Configuración de la app → Básica</strong>. El App Secret aparece
            al darle &quot;Mostrar&quot;.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="wa-wiz-app-id" className={label}>
                App ID
              </label>
              <input
                id="wa-wiz-app-id"
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                disabled={loading}
                placeholder={saved?.whatsappAppId ? `Actual: ${saved.whatsappAppId}` : "Ej. 1234567890"}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="wa-wiz-app-secret" className={label}>
                App Secret
              </label>
              <input
                id="wa-wiz-app-secret"
                type={showSecrets ? "text" : "password"}
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                autoComplete="new-password"
                spellCheck={false}
                disabled={loading}
                placeholder="Clave secreta de la aplicación"
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </Step>

        <Step n={4} title="Genera un token permanente y conecta">
          <p>
            En <strong>Configuración de la empresa → Usuarios del sistema</strong>: crea un
            usuario Admin, asígnale esta App y tu cuenta de WhatsApp Business, y genera un token{" "}
            <strong>sin fecha de expiración</strong> con{" "}
            <strong>los dos permisos</strong>: <code>whatsapp_business_messaging</code> y{" "}
            <code>whatsapp_business_management</code>.
          </p>
          <div>
            <label htmlFor="wa-wiz-token" className={label}>
              Token de acceso
            </label>
            <div className="relative">
              <input
                id="wa-wiz-token"
                type={showSecrets ? "text" : "password"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                autoComplete="new-password"
                spellCheck={false}
                disabled={loading}
                placeholder={
                  saved?.whatsappTokenPreview
                    ? `Guardado: ${saved.whatsappTokenPreview}`
                    : "Pega el token permanente"
                }
                className={`${INPUT_CLASS} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowSecrets((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#616161] transition-colors hover:bg-[#f0f0f0] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
                aria-label={showSecrets ? "Ocultar" : "Mostrar"}
              >
                <HugeiconsIcon icon={showSecrets ? ViewOffIcon : EyeIcon} className="size-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void run()}
            disabled={loading || !canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Conectando...
              </>
            ) : (
              "Conectar"
            )}
          </button>

          {result && !result.success && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              <p className="font-medium">{result.message}</p>
              {result.detail && result.detail !== result.message && (
                <p className="mt-1 text-xs opacity-80">Meta respondió: {result.detail}</p>
              )}
            </div>
          )}

          {result?.needsSelection && (
            <div className="rounded-xl border border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
              <p className="font-medium text-[#212121] dark:text-white">{result.message}</p>
              <ul className="mt-3 space-y-2">
                {result.phoneOptions.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => void run(o.id)}
                      disabled={loading}
                      className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f5f5f5] disabled:opacity-60 dark:border-[#3a3a3a] dark:hover:bg-[#2a2a2a]"
                    >
                      <span className="font-semibold text-[#212121] dark:text-white">
                        {o.displayPhoneNumber}
                      </span>
                      {o.verifiedName ? ` — ${o.verifiedName}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result?.success && !result.needsSelection && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Encontramos <strong>{result.displayPhoneNumber}</strong>
              {result.verifiedName ? ` (${result.verifiedName})` : ""} y quedó conectado.
              {result.webhookError && (
                <p className="mt-2 text-amber-800 dark:text-amber-300">
                  No pudimos configurar el webhook solos: {result.webhookError} Usa la
                  &quot;Configuración manual (avanzado)&quot; más abajo.
                </p>
              )}
              {result.templateError && (
                <p className="mt-2 text-amber-800 dark:text-amber-300">
                  La plantilla de inicio no se creó: {result.templateError}
                </p>
              )}
            </div>
          )}
        </Step>

        <Step n={5} title="Publica tu App (modo Live)">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <HugeiconsIcon icon={Alert02Icon} size={18} className="mt-0.5 shrink-0" />
            <p>
              Arriba en el panel de tu App cambia el modo de <em>Desarrollo</em> a{" "}
              <strong>Publicada / Live</strong>. Mientras esté en desarrollo Meta{" "}
              <strong>no manda al webhook los mensajes reales</strong> y aquí nunca aparecerán,
              aunque todo lo demás esté bien. Meta pedirá la URL de una política de privacidad
              (Configuración de la app → Básica).
            </p>
          </div>
        </Step>
      </ol>
    </div>
  );
}
