/**
 * FreeSolo — Server-side API client for Spring Boot API calls.
 *
 * Used by Next.js server actions and server components to call
 * the Spring Boot REST API with the user's JWT from the cookie.
 */

import { cookies } from "next/headers";

const API_URL = process.env.SPRING_BOOT_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export async function apiCall<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("freesolo-token")?.value;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(response.status, body.message ?? "Request failed");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export function apiGet<T = unknown>(path: string) {
  return apiCall<T>(path, { method: "GET" });
}

export function apiPost<T = unknown>(path: string, body?: unknown) {
  return apiCall<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T = unknown>(path: string, body?: unknown) {
  return apiCall<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = unknown>(path: string) {
  return apiCall<T>(path, { method: "DELETE" });
}
