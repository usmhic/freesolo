/**
 * FreeSolo — Server-side guards for admin/dashboard pages.
 *
 * Reads the JWT cookie set by the Spring Boot API and verifies
 * the user's role without any extra HTTP calls.
 */

import { redirect } from "next/navigation";
import { getSession } from "./auth";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
}

export type DashboardScope = "admin" | "business";

export interface DashboardUser extends AdminUser {
  scope: DashboardScope;
  businessId: string | null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const session = await getSession();
  if (!session) redirect("/admin/sign-in");
  if (session.role !== "admin") redirect("/");
  return {
    id: session.id,
    email: session.email,
    name: session.name,
    image: session.image,
    role: session.role,
  };
}

export async function requireDashboardUser(): Promise<DashboardUser> {
  const session = await getSession();
  if (!session) redirect("/admin/sign-in");
  if (session.role !== "admin" && session.role !== "business") redirect("/");

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    image: session.image,
    role: session.role,
    scope: session.role as DashboardScope,
    businessId: session.businessId ?? null,
  };
}
