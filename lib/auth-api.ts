import { API_BASE_URL } from "@/lib/config";

export type LoginSuccess = {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
};

function parseErrorMessage(
  status: number,
  json: unknown,
  rawText: string
): string {
  if (json && typeof json === "object" && json !== null) {
    const m = (json as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
    if (m && typeof m === "object" && "message" in (m as object)) {
      const inner = (m as { message?: string }).message;
      if (typeof inner === "string" && inner.trim()) return inner;
    }
  }
  if (rawText && rawText.length < 200) return rawText;
  if (status === 401) return "Unauthorized. Check Student ID and password.";
  if (status === 400) return "Invalid request. Check Student ID and password.";
  return `Request failed (${status}). Try again.`;
}

export function getLoginEndpoint(): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/admin/login`;
}

/**
 * Student (and other) login — same as POST /api/admin/login
 */
export async function loginWithCredentials(
  username: string,
  password: string
): Promise<{ ok: true; data: LoginSuccess } | { ok: false; message: string }> {
  const url = getLoginEndpoint();
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
  } catch (e) {
    const hint =
      __DEV__ && typeof API_BASE_URL === "string" && API_BASE_URL.includes("localhost")
        ? " On a real device use your PC LAN IP or Android emulator use 10.0.2.2 instead of localhost."
        : "";
    const reason = e instanceof Error ? e.message : "Network error";
    return {
      ok: false,
      message: `Cannot reach server (${reason}).${hint} API: ${url}`,
    };
  }

  const rawText = await res.text();
  let json: unknown = null;
  if (rawText) {
    try {
      json = JSON.parse(rawText) as unknown;
    } catch {
      /* not JSON */
    }
  }

  if (!res.ok) {
    const msg = parseErrorMessage(res.status, json, rawText);
    return { ok: false, message: msg };
  }

  const data = json as Partial<LoginSuccess> | null;
  if (!data?.accessToken || !data?.refreshToken || !data?.user) {
    return {
      ok: false,
      message: "Invalid response from server (missing accessToken).",
    };
  }

  return {
    ok: true,
    data: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user as Record<string, unknown>,
    },
  };
}
