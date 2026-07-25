import type { AppRole, AppThemeColors, ColorScheme } from '@/constants/school-theme';
import { getThemeColors } from '@/constants/school-theme';
import { loadColorScheme, saveColorScheme } from '@/lib/appearance-storage';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

type AppThemeContextValue = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: AppThemeColors;
  role: AppRole | null;
  setRole: (role: AppRole | null) => void;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  toggleColorScheme: () => Promise<void>;
  ready: boolean;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function buildNavTheme(scheme: ColorScheme, colors: AppThemeColors) {
  const base = scheme === 'dark' ? NavDarkTheme : NavLightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: base.colors.primary,
      background: colors.bg,
      card: colors.header,
      text: colors.text,
      border: colors.border,
      notification: base.colors.notification,
    },
  };
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setScheme] = useState<ColorScheme>('light');
  const [role, setRole] = useState<AppRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadColorScheme().then((saved) => {
      setScheme(saved);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    void SystemUI.setBackgroundColorAsync(getThemeColors(scheme).bg);
  }, [scheme, ready]);

  const colors = useMemo(() => getThemeColors(scheme), [scheme]);
  const navTheme = useMemo(() => buildNavTheme(scheme, colors), [scheme, colors]);

  const setColorScheme = useCallback(async (next: ColorScheme) => {
    setScheme(next);
    await saveColorScheme(next);
  }, []);

  const toggleColorScheme = useCallback(async () => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    await setColorScheme(next);
  }, [scheme, setColorScheme]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      scheme,
      isDark: scheme === 'dark',
      colors,
      role,
      setRole,
      setColorScheme,
      toggleColorScheme,
      ready,
    }),
    [scheme, colors, role, setColorScheme, toggleColorScheme, ready],
  );

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider value={navTheme}>
        {children}
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
