/**
 * Aviso del back de que la sesión ya no vale: la respuesta trae `extensions.session` cuando la
 * petición mandó un token vencido, cerrado por Kadesh ("cerrar sesiones"), de una cuenta suspendida
 * o un "entrar como" que ya terminó. Aquí solo se detecta y se avisa con un evento del navegador;
 * quien saca a la persona al login es `SessionEndedListener` (kadesh/components/auth).
 */

export const SESSION_ENDED_EVENT = "kadesh:session-ended";

/** `expired`, `revoked`, `suspended`, `anonymized` o `impersonation_expired` (ver kadesh-back `auth/sessionGuards.ts`). */
export type SessionEndNotice = { status: string; message?: string };

export function readSessionEndNotice(extensions: unknown): SessionEndNotice | null {
  const session = (extensions as { session?: unknown } | null | undefined)?.session as
    | { status?: unknown; message?: unknown }
    | undefined;
  if (!session || typeof session.status !== "string") return null;
  return {
    status: session.status,
    message: typeof session.message === "string" ? session.message : undefined,
  };
}

export function notifySessionEnded(notice: SessionEndNotice): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SessionEndNotice>(SESSION_ENDED_EVENT, { detail: notice }));
}
