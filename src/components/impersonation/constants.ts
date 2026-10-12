/** Token de sesión que usa el apollo-client (ver src/providers/apollo-client.ts). */
export const SESSION_TOKEN_KEY = "keystonejs-session-token";

/** Aquí se guarda el token del admin mientras ve el panel como otra persona. */
export const ADMIN_TOKEN_BACKUP_KEY = "kadesh-admin-session-token";

/** Datos para la barra de "Viendo como…" (nombre, empresa, hasta cuándo y a dónde volver). */
export const IMPERSONATION_INFO_KEY = "kadesh-impersonation";
