import * as SecureStore from 'expo-secure-store';
import type { ColorScheme } from '@/constants/school-theme';

const APPEARANCE_KEY = 'app_color_scheme';

export async function loadColorScheme(): Promise<ColorScheme> {
  try {
    const value = await SecureStore.getItemAsync(APPEARANCE_KEY);
    return value === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export async function saveColorScheme(scheme: ColorScheme) {
  await SecureStore.setItemAsync(APPEARANCE_KEY, scheme);
}
