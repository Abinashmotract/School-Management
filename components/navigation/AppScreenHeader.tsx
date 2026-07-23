import HeaderNotificationsButton from "@/components/notifications/HeaderNotificationsButton";
import type { AppRole } from "@/constants/school-theme";
import { Neutrals } from "@/constants/school-theme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  role: AppRole;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  headerRight?: React.ReactNode;
};

export function AppScreenHeader({
  role,
  title,
  subtitle,
  showBack = false,
  showMenu = true,
  showNotifications = true,
  headerRight,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: Math.max(insets.top, Platform.OS === "android" ? 8 : 0),
        },
      ]}
    >
      <View style={styles.left}>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Neutrals.text} />
          </Pressable>
        ) : null}
        {showMenu ? (
          <DrawerToggleButton
            tintColor={Neutrals.text}
            pressColor={Platform.OS === "android" ? "rgba(0,0,0,0.08)" : undefined}
          />
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {headerRight}
        {showNotifications ? <HeaderNotificationsButton role={role} compact /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Neutrals.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 88,
  },
  center: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 88,
    gap: 2,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Neutrals.text,
  },
  subtitle: {
    fontSize: 12,
    color: Neutrals.muted,
    marginTop: 2,
  },
});
