import {
  getChatRealtimeConfig,
  type ChatMessage,
  type ChatWsServerMessage,
} from "@/lib/chat-api";
import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  channelId?: string | null;
  onMessage?: (message: ChatMessage) => void;
};

export function useChatSocket({ channelId, onMessage }: Options) {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    disconnect();
    if (!channelId) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const res = await getChatRealtimeConfig(channelId);
        if (cancelled) return;

        const config = res?.data;
        if (!config?.enabled || !config.wsUrl) {
          setConnected(false);
          return;
        }

        const ws = new WebSocket(config.wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!cancelled) setConnected(true);
        };
        ws.onclose = () => {
          if (!cancelled) setConnected(false);
        };
        ws.onerror = () => {
          if (!cancelled) setConnected(false);
        };
        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data)) as ChatWsServerMessage;
            if (payload.type === "message") {
              onMessageRef.current?.({
                id: payload.messageId,
                messageId: payload.messageId,
                channelId: payload.channelId,
                senderUsername: payload.senderUsername,
                senderDisplayName: payload.senderDisplayName,
                senderRole: payload.senderRole,
                content: payload.content,
                clientId: payload.clientId,
                createdAt: payload.createdAt,
              });
            }
          } catch {
            /* ignore */
          }
        };
      } catch {
        if (!cancelled) setConnected(false);
      }
    };

    void connect();

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [channelId, disconnect]);

  const sendMessage = useCallback((content: string, clientId?: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: "message", content, clientId }));
    return true;
  }, []);

  return { connected, sendMessage, disconnect };
}
