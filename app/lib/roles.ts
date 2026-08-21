export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type UserWithRole = { role: string };

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;
export const SUPER_ADMIN_ROLES = [ROLES.SUPER_ADMIN] as const;

export function isRole(role: string): role is Role {
  return Object.values(ROLES).some((knownRole) => knownRole === role);
}

export function hasRole(user: UserWithRole, role: Role | readonly Role[]): boolean {
  const acceptedRoles: readonly Role[] = Array.isArray(role) ? role : [role];
  return isRole(user.role) && acceptedRoles.includes(user.role);
}

export function rolesForProtectedPath(pathname: string): readonly Role[] | null {
  if (pathname === "/superadmin" || pathname.startsWith("/superadmin/")) return SUPER_ADMIN_ROLES;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return ADMIN_ROLES;
  return null;
}
