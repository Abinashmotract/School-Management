import { apiGet } from "@/lib/api-client";
import * as SecureStore from "expo-secure-store";

const SELECTED_CHILD_KEY = "parent_selected_student_id";

export type ParentProfile = {
  username: string;
  parentName?: string;
  parentPhone?: string;
  linked?: boolean;
  studentCount?: number;
};

export type ParentChild = {
  studentId: string;
  admissionNumber?: string;
  studentName?: string;
  className?: string;
  section?: string;
  rollNumber?: string;
  session?: string;
  photo?: string;
};

export type ParentPortalMe = {
  parent: ParentProfile;
  children: ParentChild[];
  message?: string;
};

export type ParentChildrenResponse = {
  children: ParentChild[];
};

export type ParentAttendanceSummary = {
  total?: number;
  present?: number;
  absent?: number;
  late?: number;
  leave?: number;
  half_day?: number;
  quarter_day?: number;
  not_marked?: number;
  [key: string]: number | undefined;
};

export type ParentAttendanceRecord = {
  _id?: string;
  date: string;
  statusKey?: string;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  source?: string;
  session?: string;
};

export type ParentChildAttendance = {
  studentId: string;
  summary: ParentAttendanceSummary;
  records: ParentAttendanceRecord[];
};

export type ParentFeesSummary = {
  totalAssigned: number;
  totalDiscount: number;
  totalPaid: number;
  balance: number;
};

export type ParentChildFees = {
  studentId: string;
  summary: ParentFeesSummary;
  feeGroups: unknown[];
  recentPayments: unknown[];
};

export type ParentChildResults = {
  studentId: string;
  results: unknown[];
};

export function childDisplayName(child?: ParentChild | null) {
  return child?.studentName?.trim() || "Student";
}

export function childClassLabel(child?: ParentChild | null) {
  const parts = [child?.className, child?.section].filter(Boolean);
  if (!parts.length) return "Class not set";
  return parts.join(" · ");
}

export function attendancePercent(summary?: ParentAttendanceSummary | null) {
  if (!summary) return null;
  const present =
    (summary.present || 0) +
    (summary.late || 0) +
    (summary.half_day || 0) +
    (summary.quarter_day || 0);
  const marked =
    (summary.total || 0) - (summary.not_marked || 0);
  if (marked <= 0) return null;
  return Math.round((present / marked) * 100);
}

export async function getSelectedChildId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SELECTED_CHILD_KEY);
  } catch {
    return null;
  }
}

export async function setSelectedChildId(studentId: string | null) {
  try {
    if (!studentId) {
      await SecureStore.deleteItemAsync(SELECTED_CHILD_KEY);
      return;
    }
    await SecureStore.setItemAsync(SELECTED_CHILD_KEY, studentId);
  } catch {
    /* ignore persistence errors */
  }
}

export function resolveSelectedChild(
  children: ParentChild[],
  preferredId?: string | null
): ParentChild | null {
  if (!children.length) return null;
  if (preferredId) {
    const match = children.find((c) => c.studentId === preferredId);
    if (match) return match;
  }
  return children[0];
}

export async function fetchParentMe(): Promise<ParentPortalMe> {
  return apiGet<ParentPortalMe>("/parent/portal/me");
}

export async function fetchParentChildren(): Promise<ParentChild[]> {
  const response = await apiGet<ParentChildrenResponse>("/parent/portal/children");
  return response?.children || [];
}

export async function fetchChildAttendance(
  studentId: string,
  opts?: { session?: string; days?: number }
): Promise<ParentChildAttendance> {
  return apiGet<ParentChildAttendance>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/attendance`,
    {
      session: opts?.session,
      days: opts?.days ?? 30,
    }
  );
}

export async function fetchChildFees(
  studentId: string,
  session?: string
): Promise<ParentChildFees> {
  return apiGet<ParentChildFees>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/fees`,
    { session }
  );
}

export async function fetchChildResults(
  studentId: string
): Promise<ParentChildResults> {
  return apiGet<ParentChildResults>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/results`
  );
}

export type ParentTimetableSlot = {
  day?: string;
  startTime?: string;
  endTime?: string;
  subjectName?: string;
  teacherName?: string;
  className?: string;
  sectionName?: string;
};

export async function fetchChildTimetable(
  studentId: string,
  session?: string
): Promise<ParentTimetableSlot[]> {
  const response = await apiGet<ParentTimetableSlot[] | { data?: ParentTimetableSlot[] }>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/timetable`,
    { session }
  );
  if (Array.isArray(response)) return response;
  return response?.data || [];
}
