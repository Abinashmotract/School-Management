import HeaderNotificationsButton from "@/components/notifications/HeaderNotificationsButton";
import { RoleColors, type AppRole } from "@/constants/school-theme";
import { useAppTheme } from "@/providers/AppThemeProvider";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Platform } from "react-native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

export function portalTabScreenOptions(role: AppRole): BottomTabNavigationOptions {
  const tint = RoleColors[role].tabActive;

  return {
    headerShown: true,
    headerLeft: () => <DrawerToggleButton tintColor={tint} />,
    headerRight: () => <HeaderNotificationsButton role={role} />,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: "transparent" },
    headerTitleStyle: { fontWeight: "700", fontSize: 17 },
    headerTintColor: tint,
  };
}

export function usePortalTabScreenOptions(role: AppRole): BottomTabNavigationOptions {
  const { colors } = useAppTheme();
  const tint = RoleColors[role].tabActive;
  const base = portalTabScreenOptions(role);

  return {
    ...base,
    headerLeft: () => (
      <DrawerToggleButton
        tintColor={colors.text}
        pressColor={Platform.OS === "android" ? `${tint}22` : undefined}
      />
    ),
    headerStyle: { backgroundColor: colors.header },
    headerTitleStyle: { fontWeight: "700", color: colors.text, fontSize: 17 },
    headerTintColor: colors.text,
    tabBarStyle: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.tabBarBorder,
      paddingTop: 4,
      height: Platform.OS === "ios" ? 88 : 64,
    },
    tabBarActiveTintColor: tint,
    tabBarInactiveTintColor: colors.tabInactive,
  };
}
