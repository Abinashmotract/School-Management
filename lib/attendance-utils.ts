import type { AttendanceStatusKey } from "@/lib/student-portal-api";

export type QuickAttendanceStatus = "present" | "absent" | "late";

export function localTodayYmd(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftYmd(value: string, amount: number) {
  const [year, month, day] = value.split("-").map(Number);
  const next = new Date(year, (month || 1) - 1, day || 1);
  next.setDate(next.getDate() + amount);
  return localTodayYmd(next);
}

export function formatAttendanceDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function attendanceStatusLabel(status?: AttendanceStatusKey) {
  if (status === "present" || status === "half_day" || status === "quarter_day") return "Present";
  if (status === "absent") return "Absent";
  if (status === "late") return "Late";
  if (status === "leave") return "Leave";
  if (status === "not_marked") return "Not marked";
  return "Not marked";
}

export function attendanceStatusColor(status?: AttendanceStatusKey) {
  if (status === "present" || status === "half_day" || status === "quarter_day") return "#16A34A";
  if (status === "absent") return "#DC2626";
  if (status === "late") return "#D97706";
  if (status === "leave") return "#6366F1";
  return "#64748B";
}

export function toQuickAttendanceStatus(status?: AttendanceStatusKey): QuickAttendanceStatus {
  if (status === "absent") return "absent";
  if (status === "late") return "late";
  return "present";
}

export function attendedStatusKeys(): AttendanceStatusKey[] {
  return ["present", "late", "half_day", "quarter_day"];
}

export function countAttendanceSummary(
  marks: Record<string, AttendanceStatusKey | QuickAttendanceStatus | undefined>
) {
  return Object.values(marks).reduce(
    (acc, status) => {
      const key = toQuickAttendanceStatus(status as AttendanceStatusKey);
      acc[key] += 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0 }
  );
}
