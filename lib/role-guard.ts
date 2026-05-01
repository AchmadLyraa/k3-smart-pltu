import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type UserRole = "SUPER_ADMIN" | "HSE_ADMIN" | "REWARD_ADMIN" | "WORKER";

/**
 * Verify user is authenticated and has required role(s)
 */
export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (session.user as any).role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      redirect("/dashboard");
    }
  }

  return session;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userRole = (session.user as any).role as UserRole;
  const roles = Array.isArray(role) ? role : [role];

  return roles.includes(userRole);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get current user with role info
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  return {
    id: (session.user as any).id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role as UserRole,
  };
}

/**
 * Check if user is admin (SUPER_ADMIN, HSE_ADMIN, or REWARD_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);
}
