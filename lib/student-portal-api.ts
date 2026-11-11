import { apiGet, apiPost, unwrapData } from "@/lib/api-client";

export type BasicInformation = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photo?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type ParentInformation = {
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
};

export type AcademicInformation = {
  session?: string;
  medium?: string;
  mediumName?: string;
  admissionClass?: string;
  className?: string;
  admissionSection?: string;
  sectionName?: string;
  rollNumber?: string;
  houseId?: string;
  houseName?: string;
};

export type FeesInformation = {
  feesGroupId?: string;
  session?: string;
  totalAmount?: number;
  discountApplied?: number;
  scholarshipApplied?: boolean;
  scholarshipAmount?: number;
  selectedFees?: unknown[];
  paymentMode?: string;
};

export type StudentProfile = {
  studentId: string;
  admissionNumber?: string;
  basicInformation?: BasicInformation;
  parentInformation?: ParentInformation;
  academicInformation?: AcademicInformation;
  feesInformation?: FeesInformation;
  vouchers?: unknown[];
  houseName?: string;
};

export type PortalOverview = {
  session: string;
  className: string;
  sectionName: string;
  medium: string;
  studentName: string;
  admissionNumber?: string;
  rollNumber?: string;
};

export type LessonPlanRow = {
  _id?: string;
  planId?: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  teacherName?: string;
  topicName?: string;
  learningObjectives?: string[];
  keyContent?: string;
  teachingMethodology?: string;
  resources?: string[];
  startDate?: string;
  endDate?: string;
  status?: "draft" | "active" | "completed";
};

export type StudyMaterialRow = {
  materialId?: string;
  title?: string;
  subjectId?: string;
  subjectName?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  type?: "PDF" | "Video Link" | "Document" | "Link" | string;
  fileUrl?: string;
  externalUrl?: string;
  createdAt?: string;
};

export type TimetableSlot = {
  _id?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  teacherUsername?: string;
  teacherName?: string;
  teacherDesignation?: string;
  teacherDepartment?: string;
  roomId?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
};

export type StudentTeacherProfile = {
  username: string;
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  employeeId?: string;
  photo?: string;
};

export type StudentSubjectTeacher = {
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  subjectType?: string;
  teacherRole?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  teacher: StudentTeacherProfile | null;
};

export type StudentTeachersResponse = {
  classTeacher: StudentTeacherProfile | null;
  substituteClassTeacher: StudentTeacherProfile | null;
  subjectTeachers: StudentSubjectTeacher[];
};

export type AttendanceStatusKey =
  | "present"
  | "absent"
  | "late"
  | "leave"
  | "half_day"
  | "quarter_day"
  | "not_marked";

export type StudentAttendanceRecord = {
  _id?: string;
  date: string;
  statusKey: AttendanceStatusKey;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  source?: string;
};

export type StudentAttendanceResponse = {
  fromDate: string;
  toDate: string;
  days: number;
  records: StudentAttendanceRecord[];
};

function fullName(parts?: BasicInformation) {
  return [parts?.firstName, parts?.middleName, parts?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function toPortalOverview(profile: StudentProfile): PortalOverview {
  const academic = profile.academicInformation || {};
  return {
    session: academic.session || "Current session",
    className: academic.className || academic.admissionClass || "Class",
    sectionName: academic.sectionName || academic.admissionSection || "",
    medium: academic.mediumName || academic.medium || "—",
    studentName: fullName(profile.basicInformation) || "Student",
    admissionNumber: profile.admissionNumber,
    rollNumber: academic.rollNumber,
  };
}

export async function fetchStudentProfile(session?: string): Promise<StudentProfile> {
  return apiGet<StudentProfile>("/student/portal/me", { session });
}

export async function fetchPortalOverview(session?: string): Promise<PortalOverview> {
  return toPortalOverview(await fetchStudentProfile(session));
}

export async function fetchLessonPlans(
  profile?: StudentProfile
): Promise<LessonPlanRow[]> {
  const classId = profile?.academicInformation?.admissionClass;
  if (!classId) return [];
  const response = await apiGet<{ success?: boolean; data?: LessonPlanRow[] } | LessonPlanRow[]>(
    "/institute/academics/lesson-plans",
    { classId }
  );
  const rows = unwrapData<LessonPlanRow[]>(response);
  return rows.filter((row) => row.status !== "draft");
}

export async function fetchStudyMaterials(
  profile?: StudentProfile
): Promise<StudyMaterialRow[]> {
  const response = await apiGet<{ success?: boolean; data?: StudyMaterialRow[] } | StudyMaterialRow[]>(
    "/student/portal/study-materials",
    { session: profile?.academicInformation?.session }
  );
  return unwrapData<StudyMaterialRow[]>(response);
}

export async function fetchTimetable(
  profile?: StudentProfile
): Promise<TimetableSlot[]> {
  return apiGet<TimetableSlot[]>("/student/portal/timetable", {
    session: profile?.academicInformation?.session,
  });
}

export async function fetchStudentTeachers(
  session?: string
): Promise<StudentTeachersResponse> {
  return apiGet<StudentTeachersResponse>("/student/portal/teachers", {
    session,
  });
}

export async function fetchStudentAttendance(
  session?: string,
  days = 360
): Promise<StudentAttendanceResponse> {
  return apiGet<StudentAttendanceResponse>("/student/portal/attendance", {
    session,
    days,
  });
}

export type StudentResultRow = {
  _id?: string;
  examId?: string;
  examName?: string;
  subjectName?: string;
  subjectId?: string;
  marksObtained?: number;
  maxMarks?: number;
  grade?: string;
  percentage?: number | null;
  remarks?: string;
  session?: string;
};

export type StudentFeePayment = {
  paymentId?: string;
  invoiceId?: string;
  schoolInvoiceNumber?: string;
  totalPaid?: number;
  paymentMode?: string;
  paymentDate?: string;
};

export type StudentFeesResponse = {
  summary?: {
    totalAssigned?: number;
    totalDiscount?: number;
    totalPaid?: number;
    balance?: number;
  };
  recentPayments?: StudentFeePayment[];
};

export type ExamScheduleRow = {
  scheduleId?: string;
  examId?: string;
  examName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  subjectName?: string;
  venue?: string;
};

export type TransportAllocation = {
  routeName?: string;
  stopName?: string;
  dropStopName?: string;
  pickupTime?: string;
  dropTime?: string;
  seatNumber?: string;
  vehicleNumber?: string;
  status?: string;
};

export type LibraryIssueRow = {
  issueId: string;
  bookTitle: string;
  issueDate?: string;
  dueDate?: string;
  returnDate?: string;
  status?: string;
  fineAmount?: number;
};

export type StudentLeaveRow = {
  requestId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: string;
};

export type StudentResultsResponse = {
  studentId: string;
  results: StudentResultRow[];
};

export async function fetchStudentResults(): Promise<StudentResultsResponse> {
  return apiGet<StudentResultsResponse>("/student/portal/results");
}

export async function fetchStudentFees(session?: string): Promise<StudentFeesResponse> {
  return apiGet<StudentFeesResponse>("/student/portal/fees", { session });
}

export async function fetchExamSchedule(session?: string): Promise<ExamScheduleRow[]> {
  const response = await apiGet<{ schedule?: ExamScheduleRow[] }>("/student/portal/exam-schedule", { session });
  return response?.schedule || [];
}

export async function fetchStudentTransport(): Promise<TransportAllocation | null> {
  const response = await apiGet<{ allocation?: TransportAllocation | null }>("/student/portal/transport");
  return response?.allocation || null;
}

export async function fetchStudentLibrary(): Promise<LibraryIssueRow[]> {
  const response = await apiGet<{ issues?: LibraryIssueRow[] }>("/student/portal/library");
  return response?.issues || [];
}

export async function fetchStudentLeaves(): Promise<StudentLeaveRow[]> {
  const response = await apiGet<{ leaves?: StudentLeaveRow[] }>("/student/portal/leaves");
  return response?.leaves || [];
}

export async function applyStudentLeave(payload: { startDate: string; endDate: string; reason: string }) {
  return apiPost<{ message?: string }>("/student/portal/leaves", payload);
}

export async function changeStudentPassword(payload: { oldPassword: string; newPassword: string }) {
  return apiPost<{ message?: string }>("/student/portal/change-password", payload);
}

export async function saveStudentPushToken(payload: { token: string; platform?: string; enabled: boolean }) {
  return apiPost<{ message?: string }>("/student/portal/push-token", payload);
}
