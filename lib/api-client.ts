import { API_BASE_URL } from "@/lib/config";
import { refreshAccessToken } from "@/lib/auth-api";
import { store } from "@/store/index";
import { sessionRefreshed } from "@/store/slices/authSlice";
import * as SecureStore from "expo-secure-store";

type QueryValue = string | number | boolean | null | undefined;

const SK_ACCESS = "auth_access_token";
const SK_REFRESH = "auth_refresh_token";

function baseUrl() {
  return API_BASE_URL.replace(/\/$/, "");
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return `${baseUrl()}${normalizedPath}${queryString ? `?${queryString}` : ""}`;
}

export function getAuthUser() {
  return store.getState().auth.user;
}

export function getInstitutionId() {
  const user = getAuthUser();
  const value = user?.institutionId;
  return value ? String(value) : "";
}

export function getUsername() {
  const user = getAuthUser();
  const value = user?.username;
  return value ? String(value) : "";
}

export function authHeaders(): HeadersInit {
  const token = store.getState().auth.accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function extractError(status: number, data: unknown, rawText: string) {
  if (data && typeof data === "object" && data !== null) {
    const msg = (data as { message?: unknown; error?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
    const err = (data as { error?: unknown }).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  if (rawText && rawText.length < 200) return rawText;
  return `Request failed (${status})`;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync(SK_REFRESH);
    if (!refreshToken) return false;

    const result = await refreshAccessToken(refreshToken);
    if (!result.ok) return false;

    await SecureStore.setItemAsync(SK_ACCESS, result.data.accessToken);
    await SecureStore.setItemAsync(SK_REFRESH, result.data.refreshToken);

    const state = store.getState().auth;
    if (state.user) {
      store.dispatch(
        sessionRefreshed({
          accessToken: result.data.accessToken,
          user: { ...state.user, ...result.data.user },
        })
      );
    } else {
      store.dispatch(sessionRefreshed({ accessToken: result.data.accessToken }));
    }

    return true;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
  retryOn401 = true
): Promise<T> {
  const { query, headers, body, ...rest } = options;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      ...authHeaders(),
      ...(headers || {}),
    },
    body,
  });

  const rawText = await res.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText) as unknown;
    } catch {
      if (!res.ok) throw new Error(extractError(res.status, data, rawText));
      return rawText as T;
    }
  }

  if (res.status === 401 && retryOn401) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (!res.ok) {
    throw new Error(extractError(res.status, data, rawText));
  }

  return data as T;
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>
): Promise<T> {
  return apiRequest<T>(path, { method: "GET", query });
}

export async function apiPost<T>(
  path: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(
  path: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function unwrapData<T>(response: T | { success?: boolean; data?: T }): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as { data?: T }).data !== undefined
  ) {
    return (response as { data: T }).data;
  }
  return response as T;
}
