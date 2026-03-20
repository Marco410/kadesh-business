import { Role } from "kadesh/constants/constans";
import type { User } from "kadesh/utils/types";

export function userHasRole(
  user: User | undefined,
  roleName: Role | string
): boolean {
  return user?.roles?.some((r) => r.name === roleName) ?? false;
}

/** Usuario con rol administrador de empresa (saas). */
export function isAdminCompanyUser(user: User | undefined): boolean {
  return userHasRole(user, Role.ADMIN_COMPANY);
}
