import {
  apiGet,
  apiPost,
  getInstitutionId,
  getUsername,
  unwrapData,
} from "@/lib/api-client";
import type { LessonPlanRow } from "@/lib/student-portal-api";

type NamedRef = {
  name?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
};

export type ClassTeacherAllocation = {
  classTeacherId?: string;
  classId?: string;
  sectionId?: string;
  session?: string;
  class?: NamedRef;
  section?: NamedRef;
};

export type SubjectTeacherAllocation = {
  subjectTeacherId?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  session?: string;
  class?: NamedRef;
  section?: NamedRef;
  subject?: NamedRef;
};

export type TeacherAllocations = {
  classTeacher: ClassTeacherAllocation[];
  subjectTeacher: SubjectTeacherAllocation[];
};

export type TeacherScheduleSlot = {
  _id?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  roomId?: string;
};

export type TeacherStudentRow = {
  studentId?: string;
  admissionNumber?: string;
  rollNumber?: string;
  basicInformation?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  academicInformation?: {
    admissionClass?: string;
    admissionSection?: string;
    rollNumber?: string;
    session?: string;
  };
  studentInformation?: {
    studentId?: string;
    admissionNumber?: string;
    basicInformation?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
    };
    academicInformation?: {
      admissionClass?: string;
      admissionSection?: string;
      session?: string;
    };
  };
};

export type LeaveBalance = {
  academicYear?: string;
  balances?: Record<string, number>;
  [key: string]: unknown;
};

export type LeaveApplication = {
  applicationId?: string;
  leaveTypeId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  reason?: string;
  [key: string]: unknown;
};

function currentTeacherUsername() {
  return getUsername();
}

export async function fetchTeacherAllocations(): Promise<TeacherAllocations> {
  const teacherUsername = currentTeacherUsername();
  if (!teacherUsername) return { classTeacher: [], subjectTeacher: [] };

  return apiGet<TeacherAllocations>("/teacher/portal/allocations");
}

export async function fetchTeacherSchedule(day?: string): Promise<TeacherScheduleSlot[]> {
  const teacherUsername = currentTeacherUsername();
  if (!teacherUsername) return [];

  return apiGet<TeacherScheduleSlot[]>("/teacher/portal/schedule", {
    institutionId: getInstitutionId(),
    teacherUsername,
    day,
  });
}

export async function fetchTeacherLessonPlans(): Promise<LessonPlanRow[]> {
  const teacherId = currentTeacherUsername();
  if (!teacherId) return [];

  const response = await apiGet<{ success?: boolean; data?: LessonPlanRow[] } | LessonPlanRow[]>(
    "/teacher/portal/lesson-plans"
  );
  return unwrapData<LessonPlanRow[]>(response);
}

function unwrapStudentList(response: unknown): TeacherStudentRow[] {
  if (Array.isArray(response)) return response as TeacherStudentRow[];

  if (response && typeof response === "object") {
    const obj = response as {
      data?: unknown;
      students?: unknown;
      results?: unknown;
    };
    if (Array.isArray(obj.data)) return obj.data as TeacherStudentRow[];
    if (Array.isArray(obj.students)) return obj.students as TeacherStudentRow[];
    if (Array.isArray(obj.results)) return obj.results as TeacherStudentRow[];
  }

  return [];
}

export async function fetchTeacherStudents(
  _allocations?: TeacherAllocations,
  session?: string
): Promise<TeacherStudentRow[]> {
  const teacherUsername = currentTeacherUsername();
  if (!teacherUsername) return [];

  const response = await apiGet<unknown>("/teacher/portal/students", { session });
  return unwrapStudentList(response);
}

function unwrapLeaveApplications(response: unknown): LeaveApplication[] {
  if (Array.isArray(response)) return response as LeaveApplication[];
  if (response && typeof response === "object") {
    const obj = response as {
      applications?: LeaveApplication[];
      data?: LeaveApplication[];
    };
    if (Array.isArray(obj.applications)) return obj.applications;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

export async function fetchLeaveBalance(): Promise<LeaveBalance> {
  return apiGet<LeaveBalance>("/teacher/portal/leaves/balance");
}

export async function fetchMyLeaves(): Promise<LeaveApplication[]> {
  const response = await apiGet<unknown>("/teacher/portal/leaves/my");
  return unwrapLeaveApplications(response);
}

export async function applyLeave(payload: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  return apiPost<LeaveApplication>("/teacher/portal/leaves/apply", payload);
}

export type AttendanceMarkRow = {
  personId: string;
  statusKey: "present" | "absent" | "late" | "leave";
  studentName?: string;
};

export async function fetchClassAttendance(params: {
  session: string;
  date: string;
  classId: string;
  sectionId: string;
}) {
  return apiGet<{ rows?: AttendanceMarkRow[]; records?: AttendanceMarkRow[] }>(
    "/teacher/portal/attendance/records",
    params
  );
}

export async function saveClassAttendance(payload: {
  session: string;
  date: string;
  classId: string;
  sectionId: string;
  rows: AttendanceMarkRow[];
}) {
  return apiPost<{ saved?: number; message?: string }>(
    "/teacher/portal/attendance/records",
    payload
  );
}
