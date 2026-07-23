import { apiGet, apiPost, getUsername, unwrapData } from "@/lib/api-client";

const BASE = "/institute/chat";

export type ChatChannelType = "staff" | "student" | "dm";

export type ChatChannel = {
  id: string;
  channelId: string;
  name: string;
  description?: string;
  channelType: ChatChannelType;
  isPublic: boolean;
  memberUsernames: string[];
  dmParticipants: string[];
  lastMessageAt?: string | null;
  lastMessagePreview?: string;
  isMember?: boolean;
};

export type ChatMessage = {
  id: string;
  messageId: string;
  channelId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderRole: string;
  content: string;
  clientId?: string;
  createdAt: string;
};

export type ChatParticipant = {
  username: string;
  displayName: string;
  role: string;
};

export type ChatWsServerMessage =
  | {
      type: "message";
      messageId: string;
      channelId: string;
      content: string;
      senderUsername: string;
      senderDisplayName: string;
      senderRole: string;
      createdAt: string;
      clientId?: string;
    }
  | { type: "typing"; username: string; displayName: string; isTyping: boolean }
  | { type: "connected"; channelId: string; username: string }
  | { type: "error"; message: string };

export function currentChatUsername() {
  return getUsername();
}

export async function fetchChatChannels(): Promise<ChatChannel[]> {
  const response = await apiGet<{ success?: boolean; data?: ChatChannel[] } | ChatChannel[]>(
    `${BASE}/channels`,
  );
  return unwrapData<ChatChannel[]>(response);
}

export async function fetchChatMessages(
  channelId: string,
  params?: { limit?: number; before?: string },
): Promise<ChatMessage[]> {
  const response = await apiGet<{ success?: boolean; data?: ChatMessage[] } | ChatMessage[]>(
    `${BASE}/channels/${encodeURIComponent(channelId)}/messages`,
    params,
  );
  return unwrapData<ChatMessage[]>(response);
}

export async function sendChatMessage(channelId: string, content: string, clientId?: string) {
  const response = await apiPost<{ success?: boolean; data?: ChatMessage }>(
    `${BASE}/channels/${encodeURIComponent(channelId)}/messages`,
    { content, clientId },
  );
  return unwrapData<ChatMessage>(response);
}

export async function getChatRealtimeConfig(channelId: string) {
  return apiGet<{
    success?: boolean;
    data?: { enabled: boolean; wsUrl: string; channelId: string };
  }>(`${BASE}/channels/${encodeURIComponent(channelId)}/realtime`);
}

export async function createOrGetDm(targetUsername: string) {
  const response = await apiPost<{ success?: boolean; data?: ChatChannel }>(`${BASE}/dm`, {
    targetUsername,
  });
  return unwrapData<ChatChannel>(response);
}

export async function searchChatParticipants(q: string, audience?: "all" | "staff" | "student") {
  const response = await apiGet<{ success?: boolean; data?: ChatParticipant[] }>(
    `${BASE}/participants/search`,
    { q, audience },
  );
  return unwrapData<ChatParticipant[]>(response);
}
