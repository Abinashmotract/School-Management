import type { AppRole } from "@/constants/school-theme";
import { Neutrals, RoleColors } from "@/constants/school-theme";
import {
  createOrGetDm,
  searchChatParticipants,
  type ChatParticipant,
} from "@/lib/chat-api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  role: AppRole;
};

export default function NewChatScreen({ role }: Props) {
  const primary = RoleColors[role].primary;
  const chatBase =
    role === "student" ? "/(student)/chat" : role === "parent" ? "/(parent)/chat" : "/(teacher)/chat";
  const audience = role === "teacher" ? "all" : role === "parent" ? "staff" : "staff";

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [results, setResults] = useState<ChatParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await searchChatParticipants(q, audience));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [audience, query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void search();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const startDm = async (username: string) => {
    setStarting(username);
    setError(null);
    try {
      const channel = await createOrGetDm(username);
      router.replace(`${chatBase}/${channel.channelId}` as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start chat.");
    } finally {
      setStarting(null);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>New message</Text>
      <Text style={styles.sub}>Search staff or students to start a direct chat</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Neutrals.muted} />
        <TextInput
          style={styles.input}
          placeholder="Search by name or username"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={primary} style={{ marginTop: 16 }} /> : null}

      {results.map((person) => (
        <Pressable
          key={person.username}
          style={styles.row}
          disabled={starting === person.username}
          onPress={() => void startDm(person.username)}
        >
          <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
            <Text style={[styles.avatarText, { color: primary }]}>
              {(person.displayName || person.username).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{person.displayName || person.username}</Text>
            <Text style={styles.meta}>
              {person.username} · {person.role}
            </Text>
          </View>
          {starting === person.username ? (
            <ActivityIndicator color={primary} />
          ) : (
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={primary} />
          )}
        </Pressable>
      ))}

      {!loading && query.trim().length >= 2 && results.length === 0 ? (
        <Text style={styles.empty}>No people found for &quot;{query.trim()}&quot;.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", color: Neutrals.text },
  sub: { fontSize: 14, color: Neutrals.muted, marginBottom: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Neutrals.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 15, color: Neutrals.text },
  err: { color: "#B91C1C", marginTop: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "600", color: Neutrals.text },
  meta: { fontSize: 12, color: Neutrals.muted, marginTop: 2 },
  empty: { color: Neutrals.muted, textAlign: "center", marginTop: 24 },
});
