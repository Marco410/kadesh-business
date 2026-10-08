import {
  getModuleForPermission,
  normalizePermissions,
  PERMISSION_KEYS,
  type PermissionKey,
} from "kadesh/components/profile/usuarios/permissions";
import type { User } from "kadesh/utils/types";
import {
  canManageCompanyAi,
  canManageCompanyUsers,
  isAdminCompanyUser,
  isPlatformAdminUser,
  userHasRole,
} from "kadesh/utils/user-roles";
import { Role } from "kadesh/constants/constans";

/**
 * Comprueba un permiso.
 * - Admin de empresa y admin de plataforma: siempre sí.
 * - Módulo sin `enforced`: usa el fallback de rol actual.
 * - Usuario sin lista de permisos (legado): usa el fallback.
 * - Usuario con lista: debe incluir la llave.
 */
export function can(
  user: User | undefined,
  key: PermissionKey,
  legacyFallback: () => boolean,
): boolean {
  if (isAdminCompanyUser(user) || isPlatformAdminUser(user)) {
    return true;
  }

  const mod = getModuleForPermission(key);
  if (!mod?.enforced) {
    return legacyFallback();
  }

  const list = normalizePermissions(user?.permissions);
  if (list == null) {
    return legacyFallback();
  }

  return list.includes(key);
}

export type NavAccessContext = {
  hasVendedorRole: boolean;
  isAdminCompany: boolean;
  canManageAi: boolean;
};

/** Visibilidad de un ítem del sidebar según rol + permisos. */
export function canAccessNavTab(
  user: User | undefined,
  tab: string,
  ctx: NavAccessContext,
): boolean {
  switch (tab) {
    case "inicio":
      return can(user, PERMISSION_KEYS.INICIO_VER, () => true);
    case "profile":
      return can(user, PERMISSION_KEYS.PERFIL_VER, () => true);
    case "usuarios":
      return canManageCompanyUsers(user);
    case "ai":
      return can(user, PERMISSION_KEYS.AI_VER, () => ctx.canManageAi);
    case "clientes":
      return can(user, PERMISSION_KEYS.CLIENTES_VER, () => ctx.hasVendedorRole);
    case "vendedores":
      return can(user, PERMISSION_KEYS.VENDEDORES_VER, () => ctx.isAdminCompany);
    case "archivos":
      return can(user, PERMISSION_KEYS.ARCHIVOS_VER, () => true);
    case "proyectos":
      return can(user, PERMISSION_KEYS.PROYECTOS_VER, () => true);
    case "cotizaciones":
      return can(user, PERMISSION_KEYS.COTIZACIONES_VER, () => true);
    case "calendar":
      return can(user, PERMISSION_KEYS.CALENDARIO_VER, () => true);
    case "workspaces":
      return can(user, PERMISSION_KEYS.ESPACIOS_VER, () => true);
    case "whatsapp":
      return can(user, PERMISSION_KEYS.WHATSAPP_VER, () => ctx.isAdminCompany);
    case "referidos":
    case "novedades":
      return true;
    default:
      return true;
  }
}

/** Alcance de leads a nivel empresa (antes: admin_company | user_company). */
export function canViewCompanyWideLeads(user: User | undefined): boolean {
  return can(user, PERMISSION_KEYS.CLIENTES_VER_EMPRESA, () => {
    return (
      isAdminCompanyUser(user) || userHasRole(user, Role.USER_COMPANY)
    );
  });
}
