import { useAppTheme } from '@/providers/AppThemeProvider';
import React from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  View,
  type ViewProps,
} from 'react-native';

export function ThemedScrollView({
  style,
  contentContainerStyle,
  ...props
}: ScrollViewProps) {
  const { colors } = useAppTheme();
  return (
    <ScrollView
      {...props}
      style={[{ flex: 1, backgroundColor: colors.bg }, style]}
      contentContainerStyle={contentContainerStyle}
    />
  );
}

export function ThemedView({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  return <View {...props} style={[{ backgroundColor: colors.bg }, style]} />;
}

export function ThemedCard({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
        },
        style,
      ]}
    />
  );
}
