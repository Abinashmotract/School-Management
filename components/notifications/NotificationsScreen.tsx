import { ScreenShell } from "@/components/navigation/ScreenShell";
import type { AppRole } from "@/constants/school-theme";
import { Neutrals, RoleColors } from "@/constants/school-theme";
import {
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications-api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  role: AppRole;
};

function formatWhen(value: string) {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function categoryIcon(category?: string) {
  if (category === "CHAT") return "chatbubble-ellipses-outline" as const;
  if (category === "FEE") return "wallet-outline" as const;
  if (category === "HOMEWORK") return "document-text-outline" as const;
  return "notifications-outline" as const;
}

export default function NotificationsScreen({ role }: Props) {
  const primary = RoleColors[role].primary;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await fetchMyNotifications());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onOpen = async (item: AppNotification) => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id);
      } catch {
        /* ignore */
      }
    }

    const channelMatch = item.link?.match(/[?&]channel=([^&]+)/);
    if (item.category === "CHAT" && channelMatch?.[1]) {
      const base =
        role === "student"
          ? "/(student)/chat"
          : role === "parent"
            ? "/(parent)/chat"
            : "/(teacher)/chat";
      router.push(`${base}/${decodeURIComponent(channelMatch[1])}` as never);
      return;
    }

    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)),
    );
  };

  const onMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((row) => ({ ...row, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  const markAllButton =
    unreadCount > 0 ? (
      <Pressable onPress={() => void onMarkAll()} hitSlop={8} style={styles.markAllBtn}>
        <Text style={[styles.markAllText, { color: primary }]}>Mark all</Text>
      </Pressable>
    ) : null;

  return (
    <ScreenShell
      role={role}
      title="Notifications"
      showBack
      showMenu
      headerRight={markAllButton}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
            />
          }
        >
          <View style={[styles.summaryCard, { borderColor: `${primary}33` }]}>
            <View style={[styles.summaryIcon, { backgroundColor: `${primary}18` }]}>
              <Ionicons name="notifications" size={22} color={primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </Text>
              <Text style={styles.summarySub}>
                {items.length} total notification{items.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
              <Text style={styles.err}>{error}</Text>
            </View>
          ) : null}

          {items.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="notifications-off-outline" size={32} color={Neutrals.muted} />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                Updates about chat, homework, fees, and school announcements will appear here.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.row,
                  !item.isRead && styles.rowUnread,
                  !item.isRead && { borderLeftColor: primary },
                  pressed && styles.rowPressed,
                ]}
                onPress={() => void onOpen(item)}
              >
                <View style={[styles.icon, { backgroundColor: `${primary}14` }]}>
                  <Ionicons name={categoryIcon(item.category)} size={20} color={primary} />
                </View>
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowTitle, !item.isRead && styles.rowTitleUnread]}>
                      {item.title}
                    </Text>
                    {!item.isRead ? (
                      <View style={[styles.unreadPill, { backgroundColor: `${primary}18` }]}>
                        <Text style={[styles.unreadPillText, { color: primary }]}>New</Text>
                      </View>
                    ) : null}
                  </View>
                  {item.message ? (
                    <Text style={styles.rowMsg} numberOfLines={3}>
                      {item.message}
                    </Text>
                  ) : null}
                  <Text style={styles.rowTime}>{formatWhen(item.createdAt)}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  markAllBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  markAllText: { fontSize: 13, fontWeight: "600" },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: Neutrals.text },
  summarySub: { fontSize: 13, color: Neutrals.muted, marginTop: 2 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  err: { flex: 1, color: "#B91C1C", fontSize: 13 },
  emptyBox: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Neutrals.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Neutrals.text },
  emptyText: {
    fontSize: 14,
    color: Neutrals.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Neutrals.border,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  rowUnread: {
    backgroundColor: "#FFFFFF",
  },
  rowPressed: { opacity: 0.92 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: Neutrals.text },
  rowTitleUnread: { fontWeight: "700" },
  unreadPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unreadPillText: { fontSize: 10, fontWeight: "700" },
  rowMsg: { fontSize: 13, color: Neutrals.muted, marginTop: 6, lineHeight: 18 },
  rowTime: { fontSize: 11, color: Neutrals.muted, marginTop: 8 },
});
