"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import {
  CONNECT_GOOGLE_CALENDAR_ACCOUNT_MUTATION,
  type ConnectGoogleCalendarAccountResponse,
  type ConnectGoogleCalendarAccountVariables,
} from "./queries";

type Status = "working" | "success" | "error";

/**
 * Destino del redirect de Google (`?code&state`). El `code` es de un solo uso, por eso el
 * intercambio se dispara una única vez aunque React monte el efecto dos veces (StrictMode).
 */
export default function GoogleCalendarCallbackSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const startedRef = useRef(false);
  const [status, setStatus] = useState<Status>("working");
  const [message, setMessage] = useState("Conectando tu cuenta de Google…");

  const [connect] = useMutation<
    ConnectGoogleCalendarAccountResponse,
    ConnectGoogleCalendarAccountVariables
  >(CONNECT_GOOGLE_CALENDAR_ACCOUNT_MUTATION);

  useEffect(() => {
    if (userLoading || startedRef.current) return;

    const fail = (text: string) => {
      startedRef.current = true;
      setStatus("error");
      setMessage(text);
    };

    if (searchParams.get("error")) {
      fail("No autorizaste el acceso a Google Calendar. Puedes intentarlo de nuevo cuando quieras.");
      return;
    }
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      fail("La respuesta de Google está incompleta. Vuelve a iniciar la conexión.");
      return;
    }
    if (!user) {
      fail("Inicia sesión en Kadesh y vuelve a conectar tu cuenta de Google.");
      return;
    }

    startedRef.current = true;
    connect({ variables: { code, state } })
      .then(({ data }) => {
        const result = data?.connectGoogleCalendarAccount;
        if (!result?.success) {
          setStatus("error");
          setMessage(result?.message || "No se pudo conectar la cuenta de Google.");
          return;
        }
        setStatus("success");
        setMessage(
          result.googleAccountEmail
            ? `Conectaste ${result.googleAccountEmail}. Ahora elige qué calendarios quieres ver.`
            : result.message,
        );
        sileo.success({ title: result.message });
        setTimeout(() => router.replace(Routes.panelCalendar), 1800);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "No se pudo conectar la cuenta de Google.");
      });
  }, [userLoading, user, searchParams, connect, router]);

  return (
    <div className="rounded-2xl border border-[#e0e0e0] bg-white p-8 text-center shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
      {status === "working" ? (
        <span className="mx-auto block size-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      ) : (
        <div
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${
            status === "success"
              ? "bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400"
              : "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          }`}
        >
          <HugeiconsIcon
            icon={status === "success" ? CheckmarkCircle02Icon : Alert02Icon}
            size={40}
          />
        </div>
      )}
      <h1 className="mt-6 text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
        {status === "success"
          ? "Cuenta conectada"
          : status === "error"
            ? "No se pudo conectar"
            : "Conectando Google Calendar"}
      </h1>
      <p className="mt-2 text-[#616161] dark:text-[#b0b0b0]">{message}</p>
      {status !== "working" ? (
        <Link
          href={Routes.panelCalendar}
          className="mt-8 inline-block w-full rounded-xl bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
        >
          Ir a mi calendario
        </Link>
      ) : null}
    </div>
  );
}
