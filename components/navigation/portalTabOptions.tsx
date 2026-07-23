import HeaderNotificationsButton from "@/components/notifications/HeaderNotificationsButton";
import { RoleColors, type AppRole } from "@/constants/school-theme";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Platform } from "react-native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

export function portalTabScreenOptions(role: AppRole): BottomTabNavigationOptions {
  const tint = RoleColors[role].tabActive;

  return {
    headerShown: true,
    headerLeft: () => (
      <DrawerToggleButton
        tintColor="#1E293B"
        pressColor={Platform.OS === "android" ? `${tint}22` : undefined}
      />
    ),
    headerRight: () => <HeaderNotificationsButton role={role} />,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: "#fff" },
    headerTitleStyle: { fontWeight: "600", color: "#1E293B", fontSize: 17 },
    headerTintColor: "#1E293B",
  };
}
