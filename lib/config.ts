import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

/**
 * Base URL including `/api`.
 * Set `EXPO_PUBLIC_API_URL` in `.env` or `app.json` → `extra.apiUrl`.
 *
 * - iOS Simulator: `http://localhost:8000/api` works.
 * - Android Emulator: use `http://10.0.2.2:8000/api` (not localhost).
 * - Physical device: use your computer's LAN IP, e.g. `http://192.168.1.10:8000/api`.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  extra?.apiUrl ||
  "http://localhost:8000/api";
