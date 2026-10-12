import { Routes } from "kadesh/core/routes";
import {
  ADMIN_TOKEN_BACKUP_KEY,
  IMPERSONATION_INFO_KEY,
  SESSION_TOKEN_KEY,
} from "./constants";

/**
 * "Entrar como" desde Operaciones. El back entrega un token de la persona que dura una hora y
 * solo permite ver (bloquea toda mutación). Aquí se guarda el token del admin, se usa el de la
 * persona y, al salir, se avisa al back (queda en Actividad) y se restaura el del admin.
 */

export type ImpersonationInfo = {
  userName: string;
  companyName: string | null;
  expiresAt: string;
  returnUrl: string;
};

const END_IMPERSONATION_MUTATION = `mutation EndImpersonation { endImpersonation { success } }`;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readImpersonation(): ImpersonationInfo | null {
  const raw = storage()?.getItem(IMPERSONATION_INFO_KEY);
  if (!raw) return null;
  try {
    const info = JSON.parse(raw) as ImpersonationInfo;
    return info?.userName && info.expiresAt ? info : null;
  } catch {
    return null;
  }
}

export function isImpersonating(): boolean {
  return Boolean(storage()?.getItem(IMPERSONATION_INFO_KEY));
}

export function beginImpersonation(token: string, info: ImpersonationInfo) {
  const store = storage();
  if (!store) return;
  const adminToken = store.getItem(SESSION_TOKEN_KEY);
  // No pisar el respaldo si ya se estaba viendo como alguien (no debería pasar: el back lo impide).
  if (adminToken && !store.getItem(ADMIN_TOKEN_BACKUP_KEY)) {
    store.setItem(ADMIN_TOKEN_BACKUP_KEY, adminToken);
  }
  store.setItem(SESSION_TOKEN_KEY, token);
  store.setItem(IMPERSONATION_INFO_KEY, JSON.stringify(info));
  // Recarga completa: el usuario, el workspace y el caché de Apollo vuelven a armarse con la persona.
  window.location.assign(Routes.panel);
}

/** Sale del modo "entrar como" y vuelve a donde estaba el admin. */
export async function finishImpersonation() {
  const store = storage();
  if (!store) return;
  const info = readImpersonation();
  const url = process.env.NEXT_PUBLIC_API_URL;
  const token = store.getItem(SESSION_TOKEN_KEY);
  if (url && token) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: END_IMPERSONATION_MUTATION }),
      });
    } catch {
      // Si no se pudo avisar (p. ej. el token ya venció), igual se restaura la sesión del admin.
    }
  }
  const adminToken = store.getItem(ADMIN_TOKEN_BACKUP_KEY);
  if (adminToken) store.setItem(SESSION_TOKEN_KEY, adminToken);
  else store.removeItem(SESSION_TOKEN_KEY);
  store.removeItem(ADMIN_TOKEN_BACKUP_KEY);
  store.removeItem(IMPERSONATION_INFO_KEY);
  window.location.assign(info?.returnUrl || Routes.panelAdmin);
}
