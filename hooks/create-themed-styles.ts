import type { AppThemeColors } from '@/constants/school-theme';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function createThemedStyles<T extends NamedStyles>(
  factory: (colors: AppThemeColors, isDark: boolean) => T,
) {
  return function useThemedStyles() {
    const { colors, isDark } = useAppTheme();
    return useMemo(() => StyleSheet.create(factory(colors, isDark)), [colors, isDark]);
  };
}

export function useThemeColors() {
  return useAppTheme();
}

/** Shared tokens used across portal screens */
export const themed = {
  card: (colors: AppThemeColors) => ({
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  }),
  screen: (colors: AppThemeColors) => ({
    flex: 1 as const,
    backgroundColor: colors.bg,
  }),
  subtleSurface: (colors: AppThemeColors, isDark: boolean) => ({
    backgroundColor: isDark ? colors.input : '#F8FAFC',
  }),
  errorBox: (isDark: boolean) => ({
    backgroundColor: isDark ? '#3F1D1D' : '#FEF2F2',
    borderColor: isDark ? '#7F1D1D' : '#FECACA',
  }),
  errorText: (isDark: boolean) => ({
    color: isDark ? '#FCA5A5' : '#B91C1C',
  }),
};
