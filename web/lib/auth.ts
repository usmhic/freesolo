/**
 * FreeSolo — JWT-based auth utilities for Next.js server components.
 *
 * The Spring Boot API handles all auth logic. This module:
 *  1. Reads the `freesolo-token` HttpOnly cookie set by Spring Boot
 *  2. Verifies the JWT locally (fast, no extra HTTP call)
 *  3. Returns typed user info for server components
 */

import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  status: string;
  businessId?: string | null;
}

interface TokenPayload extends JWTPayload {
  email: string;
  name?: string;
  image?: string;
  role: string;
  status: string;
  businessId?: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  const configuredSecret = process.env.JWT_SECRET;
  if (!configuredSecret) return null;

  try {
    const secret = new TextEncoder().encode(configuredSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("freesolo-token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.sub!,
    email: payload.email,
    name: payload.name ?? null,
    image: payload.image ?? null,
    role: payload.role,
    status: payload.status,
    businessId: payload.businessId ?? null,
  };
});

export type Session = { user: SessionUser };
