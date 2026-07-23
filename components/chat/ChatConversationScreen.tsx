import { AppScreenHeader } from "@/components/navigation/AppScreenHeader";
import type { AppRole } from "@/constants/school-theme";
import { Neutrals, RoleColors } from "@/constants/school-theme";
import { useChatSocket } from "@/hooks/use-chat-socket";
import {
  currentChatUsername,
  fetchChatMessages,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat-api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  role: AppRole;
};

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage) {
  if (existing.some((m) => m.messageId === incoming.messageId)) return existing;
  return [...existing, incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export default function ChatConversationScreen({ role }: Props) {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const primary = RoleColors[role].primary;
  const me = currentChatUsername();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!channelId) return;
    setError(null);
    try {
      setMessages(await fetchChatMessages(channelId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!channelId) return;
    const timer = setInterval(() => {
      void loadMessages();
    }, 8000);
    return () => clearInterval(timer);
  }, [channelId, loadMessages]);

  const { connected, sendMessage: sendWs } = useChatSocket({
    channelId,
    onMessage: (message) => {
      setMessages((prev) => mergeMessages(prev, message));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const onSend = async () => {
    const content = draft.trim();
    if (!content || !channelId || sending) return;

    setSending(true);
    const clientId = `m_${Date.now()}`;
    const sentViaWs = sendWs(content, clientId);

    if (!sentViaWs) {
      try {
        const saved = await sendChatMessage(channelId, content, clientId);
        setMessages((prev) => mergeMessages(prev, saved));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not send message.");
        setSending(false);
        return;
      }
    } else {
      const optimistic: ChatMessage = {
        id: clientId,
        messageId: clientId,
        channelId,
        senderUsername: me,
        senderDisplayName: me,
        senderRole: role.toUpperCase(),
        content,
        clientId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => mergeMessages(prev, optimistic));
    }

    setDraft("");
    setSending(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!channelId) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Invalid chat channel.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.flex}>
        <AppScreenHeader
          role={role}
          title="Conversation"
          subtitle={connected ? "Live" : "Connecting..."}
          showBack
          showMenu
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <AppScreenHeader
        role={role}
        title="Conversation"
        subtitle={connected ? "Live" : "Updates every few seconds"}
        showBack
        showMenu
      />

      {error ? <Text style={styles.errBanner}>{error}</Text> : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.messageId || item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.senderUsername === me;
          return (
            <View style={[styles.bubbleWrap, mine ? styles.bubbleWrapMine : styles.bubbleWrapOther]}>
              <View style={[styles.bubble, mine ? { backgroundColor: primary } : styles.bubbleOther]}>
                {!mine ? (
                  <Text style={styles.sender}>{item.senderDisplayName || item.senderUsername}</Text>
                ) : null}
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.content}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet. Say hello.</Text>
        }
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, { backgroundColor: primary }, sending && { opacity: 0.6 }]}
          disabled={sending || !draft.trim()}
          onPress={() => void onSend()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Neutrals.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  err: { color: "#B91C1C" },
  errBanner: { color: "#B91C1C", paddingHorizontal: 16, paddingVertical: 8, fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 8 },
  empty: { textAlign: "center", color: Neutrals.muted, marginTop: 40 },
  bubbleWrap: { marginBottom: 10, maxWidth: "85%" },
  bubbleWrapMine: { alignSelf: "flex-end" },
  bubbleWrapOther: { alignSelf: "flex-start" },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOther: { backgroundColor: Neutrals.card },
  sender: { fontSize: 11, fontWeight: "700", color: Neutrals.muted, marginBottom: 4 },
  bubbleText: { fontSize: 15, color: Neutrals.text },
  bubbleTextMine: { color: "#fff" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    backgroundColor: Neutrals.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Neutrals.border,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Neutrals.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Neutrals.text,
    backgroundColor: Neutrals.bg,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
