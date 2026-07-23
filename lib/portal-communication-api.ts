import { apiGet } from "@/lib/api-client";

export type PortalNotice = {
  noticeId: string;
  title: string;
  content?: string;
  publishDate?: string;
  category?: string;
  isNew?: boolean;
};

export type PortalEvent = {
  announcementId: string;
  title: string;
  eventDate?: string;
  publishDate?: string;
  venue?: string;
  content?: string;
  isNew?: boolean;
};

export async function fetchParentNotices(): Promise<PortalNotice[]> {
  const response = await apiGet<{ success?: boolean; data?: PortalNotice[] } | PortalNotice[]>(
    "/parent/portal/notices",
  );
  if (Array.isArray(response)) return response;
  return response?.data || [];
}

export async function fetchStudentNotices(): Promise<PortalNotice[]> {
  const response = await apiGet<{ success?: boolean; data?: PortalNotice[] } | PortalNotice[]>(
    "/student/portal/notices",
  );
  if (Array.isArray(response)) return response;
  return response?.data || [];
}

export async function fetchStudentEvents(): Promise<PortalEvent[]> {
  const response = await apiGet<{ success?: boolean; data?: PortalEvent[] } | PortalEvent[]>(
    "/student/portal/events",
  );
  if (Array.isArray(response)) return response;
  return response?.data || [];
}

export async function fetchParentEvents(): Promise<PortalEvent[]> {
  const response = await apiGet<{ success?: boolean; data?: PortalEvent[] } | PortalEvent[]>(
    "/parent/portal/events",
  );
  if (Array.isArray(response)) return response;
  return response?.data || [];
}
