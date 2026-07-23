import type { AppRole } from "@/constants/school-theme";
import * as SecureStore from "expo-secure-store";

export type PortalSettings = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
};

const defaults: PortalSettings = {
  pushNotifications: true,
  emailNotifications: true,
  darkMode: false,
};

function key(role: AppRole) {
  return `portal_settings_${role}`;
}

export async function loadPortalSettings(role: AppRole): Promise<PortalSettings> {
  try {
    const raw = await SecureStore.getItemAsync(key(role));
    if (!raw) return { ...defaults };
    return { ...defaults, ...(JSON.parse(raw) as Partial<PortalSettings>) };
  } catch {
    return { ...defaults };
  }
}

export async function savePortalSettings(role: AppRole, settings: PortalSettings) {
  await SecureStore.setItemAsync(key(role), JSON.stringify(settings));
}
