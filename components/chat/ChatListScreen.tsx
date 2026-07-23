import type { AppRole } from "@/constants/school-theme";
import { Neutrals, RoleColors } from "@/constants/school-theme";
import { fetchChatChannels, type ChatChannel } from "@/lib/chat-api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  showNewMessage?: boolean;
};

function channelIcon(channel: ChatChannel) {
  if (channel.channelType === "dm") return "person-circle-outline" as const;
  if (!channel.isPublic) return "lock-closed-outline" as const;
  return "chatbubbles-outline" as const;
}

function groupLabel(type: ChatChannel["channelType"]) {
  if (type === "dm") return "Direct messages";
  if (type === "student") return "Student groups";
  return "Staff groups";
}

export default function ChatListScreen({ role, showNewMessage = true }: Props) {
  const primary = RoleColors[role].primary;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const chatBase =
    role === "student" ? "/(student)/chat" : role === "parent" ? "/(parent)/chat" : "/(teacher)/chat";

  const load = useCallback(async () => {
    setError(null);
    try {
      setChannels(await fetchChatChannels());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load chat channels.");
      setChannels([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = ["dm", "student", "staff"].map((type) => ({
    type: type as ChatChannel["channelType"],
    items: channels.filter((c) => c.channelType === type),
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
      }
    >
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.sub}>School channels and direct messages</Text>
        </View>
        {showNewMessage ? (
          <Pressable
            style={[styles.newBtn, { backgroundColor: `${primary}18` }]}
            onPress={() => router.push(`${chatBase}/new` as never)}
          >
            <Ionicons name="create-outline" size={20} color={primary} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {channels.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="chatbubbles-outline" size={28} color={Neutrals.muted} />
          <Text style={styles.emptyText}>No chat channels available yet.</Text>
        </View>
      ) : (
        grouped.map(({ type, items }) =>
          items.length ? (
            <View key={type} style={{ marginBottom: 16 }}>
              <Text style={styles.section}>{groupLabel(type)}</Text>
              {items.map((channel) => (
                <Pressable
                  key={channel.channelId}
                  style={styles.row}
                  onPress={() => router.push(`${chatBase}/${channel.channelId}` as never)}
                >
                  <View style={[styles.icon, { backgroundColor: `${primary}18` }]}>
                    <Ionicons name={channelIcon(channel)} size={22} color={primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{channel.name}</Text>
                    <Text style={styles.preview} numberOfLines={1}>
                      {channel.lastMessagePreview || channel.description || "No messages yet"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </Pressable>
              ))}
            </View>
          ) : null,
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Neutrals.bg },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: Neutrals.text },
  sub: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
  newBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  err: { color: "#B91C1C", marginBottom: 10 },
  section: {
    fontSize: 12,
    fontWeight: "700",
    color: Neutrals.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  emptyBox: { alignItems: "center", gap: 8, paddingVertical: 48 },
  emptyText: { color: Neutrals.muted, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 16, fontWeight: "700", color: Neutrals.text },
  preview: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
});
