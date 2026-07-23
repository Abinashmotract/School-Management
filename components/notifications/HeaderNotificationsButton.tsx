import type { AppRole } from "@/constants/school-theme";
import { RoleColors } from "@/constants/school-theme";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  role: AppRole;
  compact?: boolean;
};

export default function HeaderNotificationsButton({ role, compact = false }: Props) {
  const { unread } = useUnreadNotifications();
  const primary = RoleColors[role].primary;

  return (
    <Pressable
      onPress={() => router.push(`/${role === "student" ? "(student)" : role === "parent" ? "(parent)" : "(teacher)"}/notifications` as never)}
      style={[styles.wrap, compact ? styles.wrapCompact : null]}
      hitSlop={8}
    >
      <Ionicons name="notifications-outline" size={compact ? 22 : 24} color="#1E293B" />
      {unread > 0 ? (
        <View style={[styles.badge, { backgroundColor: primary }, compact && styles.badgeCompact]}>
          <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingRight: 16, paddingLeft: 4, position: "relative", justifyContent: "center" },
  wrapCompact: { paddingRight: 10, paddingLeft: 2, minHeight: 40, minWidth: 40, alignItems: "center" },
  badge: {
    position: "absolute",
    top: -4,
    right: 10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeCompact: { right: 4, top: 2 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
