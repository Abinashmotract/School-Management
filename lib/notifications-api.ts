import { apiGet, apiPost } from "@/lib/api-client";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  category?: string;
  link?: string;
  createdAt: string;
  isRead: boolean;
  createdBy?: string;
  createdByName?: string;
};

export async function fetchMyNotifications(limit = 50): Promise<AppNotification[]> {
  const response = await apiGet<{ notifications?: AppNotification[] }>("/notifications/my", {
    limit,
  });
  return response?.notifications || [];
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiGet<{ unread?: number }>("/notifications/unread-count");
  return Number(response?.unread || 0);
}

export async function markNotificationRead(id: string) {
  return apiPost(`/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead() {
  return apiPost("/notifications/read-all");
}
