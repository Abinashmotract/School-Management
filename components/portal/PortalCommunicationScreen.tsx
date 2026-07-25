import type { AppRole } from "@/constants/school-theme";
import { RoleColors } from "@/constants/school-theme";
import { createThemedStyles, useThemeColors } from "@/hooks/create-themed-styles";
import { usePortalScreenStyles } from "@/hooks/use-portal-screen-styles";
import {
  fetchParentNotices,
  fetchStudentEvents,
  fetchStudentNotices,
  fetchParentEvents,
  type PortalEvent,
  type PortalNotice,
} from "@/lib/portal-communication-api";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type Mode = "notices" | "events";

type Props = {
  role: AppRole;
  mode: Mode;
};

const useLocalStyles = createThemedStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: "center", gap: 8, paddingVertical: 48 },
  emptyText: { color: colors.muted, textAlign: "center" },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text },
  newBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  metaRow: { gap: 4, marginBottom: 6 },
  meta: { fontSize: 12, color: colors.muted },
  category: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    backgroundColor: colors.input,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
}));

function stripHtml(html?: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

async function loadItems(role: AppRole, mode: Mode) {
  if (mode === "notices") {
    if (role === "parent") return fetchParentNotices();
    return fetchStudentNotices();
  }
  if (role === "parent") return fetchParentEvents();
  return fetchStudentEvents();
}

export default function PortalCommunicationScreen({ role, mode }: Props) {
  const primary = RoleColors[role].primary;
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<PortalNotice[]>([]);
  const [events, setEvents] = useState<PortalEvent[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await loadItems(role, mode);
      if (mode === "notices") setNotices(data as PortalNotice[]);
      else setEvents(data as PortalEvent[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load content.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, role]);

  useEffect(() => {
    void load();
  }, [load]);

  const title = mode === "notices" ? "Notices" : "Events";
  const items = mode === "notices" ? notices : events;

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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
        />
      }
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>
        {mode === "notices"
          ? "School announcements and updates"
          : "Upcoming school events"}
      </Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="megaphone-outline" size={28} color={colors.muted} />
          <Text style={styles.emptyText}>No {mode} published right now.</Text>
        </View>
      ) : null}

      {mode === "notices"
        ? notices.map((notice) => (
            <View key={notice.noticeId} style={styles.cardBlock}>
              <View style={styles.cardHead}>
                <Ionicons name="document-text-outline" size={20} color={primary} />
                <Text style={styles.cardTitle}>{notice.title}</Text>
                {notice.isNew ? <Text style={styles.newBadge}>New</Text> : null}
              </View>
              {notice.publishDate ? (
                <Text style={styles.meta}>Published {formatDate(notice.publishDate)}</Text>
              ) : null}
              {notice.category ? (
                <Text style={styles.category}>{notice.category}</Text>
              ) : null}
              {notice.content ? (
                <Text style={styles.body}>{stripHtml(notice.content)}</Text>
              ) : null}
            </View>
          ))
        : events.map((event) => (
            <View key={event.announcementId} style={styles.cardBlock}>
              <View style={styles.cardHead}>
                <Ionicons name="calendar-outline" size={20} color={primary} />
                <Text style={styles.cardTitle}>{event.title}</Text>
                {event.isNew ? <Text style={styles.newBadge}>New</Text> : null}
              </View>
              <View style={styles.metaRow}>
                {event.eventDate ? (
                  <Text style={styles.meta}>Event: {formatDate(event.eventDate)}</Text>
                ) : null}
                {event.venue ? <Text style={styles.meta}>Venue: {event.venue}</Text> : null}
              </View>
              {event.content ? (
                <Text style={styles.body}>{stripHtml(event.content)}</Text>
              ) : null}
            </View>
          ))}
    </ScrollView>
  );
}
