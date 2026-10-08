import { Role } from "kadesh/constants/constans";
import type { User } from "kadesh/utils/types";

export function userHasRole(
  user: User | undefined,
  roleName: Role | string
): boolean {
  return user?.roles?.some((r) => r.name === roleName) ?? false;
}

/** Admin de plataforma (rol `admin`). No confundir con admin de empresa. */
export function isPlatformAdminUser(user: User | undefined): boolean {
  return userHasRole(user, Role.ADMIN);
}

/** Usuario con rol administrador de empresa (saas). */
export function isAdminCompanyUser(user: User | undefined): boolean {
  return userHasRole(user, Role.ADMIN_COMPANY);
}

/** Usuario con rol Gerencia: puede administrar usuarios y permisos de la empresa. */
export function isGerenciaUser(user: User | undefined): boolean {
  return userHasRole(user, Role.GERENCIA);
}

/**
 * Admin de empresa o Gerencia: pueden abrir el módulo Usuarios,
 * crear usuarios y asignar roles/permisos.
 */
export function canManageCompanyUsers(user: User | undefined): boolean {
  return isAdminCompanyUser(user) || isGerenciaUser(user);
}

/** Admin de empresa o admin de plataforma: pueden configurar Kadesh Urim AI. */
export function canManageCompanyAi(user: User | undefined): boolean {
  return userHasRole(user, Role.ADMIN) || isAdminCompanyUser(user);
}

/** True si el usuario objetivo es admin de empresa o de plataforma (protegido). */
export function isProtectedCompanyUser(target: {
  roles?: Array<{ name: string }> | null;
}): boolean {
  return (
    target.roles?.some(
      (r) => r.name === Role.ADMIN_COMPANY || r.name === Role.ADMIN,
    ) ?? false
  );
}
