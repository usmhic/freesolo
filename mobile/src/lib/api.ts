import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { createAuthClient } from "better-auth/client";
import { emailOTPClient, genericOAuthClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";

/**
 * Resolves the FreeSolo API base URL.
 *
 * EXPO_PUBLIC_API_URL wins when set (e.g. pointing at a staging/prod deploy).
 * Otherwise, in dev, fall back to the host that's serving the Metro bundler —
 * that's the same machine running `webapi` — so the app connects correctly on
 * the iOS Simulator, an Android emulator, or a physical device on the same LAN
 * without any manual IP juggling.
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (process.env.NODE_ENV === "production") return "https://api.freesolo.osas.cloud";
  const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
  return debuggerHost ? `http://${debuggerHost}:8080` : "http://localhost:8080";
}

export const API_URL = resolveApiUrl().replace(/\/+$/, "");

const SESSION_KEY = "freesolo_session_token";

// expoClient drives the whole passwordless flow — it pairs with the expo()
// server plugin to open Google/Apple sign-in in a browser tab
// (Browser.openAuthSessionAsync), capture the resulting session cookie via a
// "freesolo://" deep link, and persist it in SecureStore. emailOTPClient /
// genericOAuthClient just add the typed client actions for OTP and Apple.
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({ scheme: "freesolo", storagePrefix: "freesolo", storage: SecureStore }),
    emailOTPClient(),
    genericOAuthClient(),
  ],
});

export const getToken   = (): Promise<string | null> => SecureStore.getItemAsync(SESSION_KEY);
export const setToken   = (t: string): Promise<void>  => SecureStore.setItemAsync(SESSION_KEY, t);
export const clearToken = (): Promise<void>            => SecureStore.deleteItemAsync(SESSION_KEY);

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const token = await getToken();
    let url = `${API_URL}${path}`;
    if (options.params) {
      const qs = new URLSearchParams(options.params).toString();
      url += `?${qs}`;
    }
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}`, Cookie: `better-auth.session_token=${token}` } : {}),
        ...(options.headers as Record<string, string> ?? {}),
      },
    });
    const json = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (!res.ok) return { data: null, error: (json.error as string) ?? "Something went wrong", status: res.status };
    return { data: (json.data ?? json) as T, error: null, status: res.status };
  } catch {
    return { data: null, error: "Network error — check your connection", status: 0 };
  }
}

function extractToken(res: { data: unknown }): string | undefined {
  const data = res.data as Record<string, any> | null;
  return data?.token ?? data?.session?.token;
}

export async function requestOtp(email: string) {
  return authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
}

export async function verifyOtp(email: string, otp: string) {
  const res = await authClient.signIn.emailOtp({ email, otp });
  const token = extractToken(res);
  if (token) await setToken(token);
  return res;
}

export async function signInWithSocial(provider: "google" | "apple") {
  const res =
    provider === "google"
      ? await authClient.signIn.social({ provider: "google", callbackURL: "freesolo://" })
      : await authClient.signIn.oauth2({ providerId: "apple", callbackURL: "freesolo://" });
  if (res.error) return res;
  // expoClient drives the browser redirect and stores the resulting session
  // cookie itself — it doesn't hand back a bearer token directly. Fetch the
  // now-active session and mirror its token into SESSION_KEY so apiFetch's
  // manual Bearer/Cookie headers keep working for plain `fetch` calls against
  // webapi routes that don't go through `authClient`.
  const session = await authClient.getSession();
  const token = (session.data as any)?.session?.token;
  if (token) await setToken(token);
  return res;
}

export async function signOut() {
  await authClient.signOut();
  await clearToken();
}

export async function uploadFile(uri: string, type = "general"): Promise<{ url: string; key: string } | null> {
  const token = await getToken();
  const formData = new FormData();
  const filename  = uri.split("/").pop() ?? "upload.jpg";
  const ext       = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeType  = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  formData.append("file", { uri, name: filename, type: mimeType } as unknown as Blob);
  formData.append("type", type);

  try {
    const res  = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await res.json() as Record<string, unknown>;
    const data = json.data as Record<string, unknown> | undefined;
    if (!data?.url || !data?.key) return null;
    return { url: data.url as string, key: data.key as string };
  } catch {
    return null;
  }
}

export async function uploadImage(uri: string, type = "general"): Promise<string | null> {
  const result = await uploadFile(uri, type);
  return result?.url ?? null;
}
