import HeaderNotificationsButton from "@/components/notifications/HeaderNotificationsButton";
import type { AppRole } from "@/constants/school-theme";
import { useAppTheme } from "@/providers/AppThemeProvider";
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
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: Math.max(insets.top, Platform.OS === "android" ? 8 : 0),
          backgroundColor: colors.header,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        ) : null}
        {showMenu ? (
          <DrawerToggleButton
            tintColor={colors.text}
            pressColor={Platform.OS === "android" ? colors.pressed : undefined}
          />
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
