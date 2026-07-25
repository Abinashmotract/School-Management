import { AppScreenHeader } from "@/components/navigation/AppScreenHeader";
import type { AppRole } from "@/constants/school-theme";
import { useAppTheme } from "@/providers/AppThemeProvider";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type Props = {
  role: AppRole;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenShell({
  role,
  title,
  subtitle,
  showBack = true,
  showMenu = true,
  showNotifications = true,
  headerRight,
  children,
  style,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }, style]}>
      <AppScreenHeader
        role={role}
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        showMenu={showMenu}
        showNotifications={showNotifications}
        headerRight={headerRight}
      />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
