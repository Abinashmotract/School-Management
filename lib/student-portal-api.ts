import { apiGet, unwrapData } from "@/lib/api-client";

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
  session?: string;
};

export type StudentResultsResponse = {
  studentId: string;
  results: StudentResultRow[];
};

export async function fetchStudentResults(): Promise<StudentResultsResponse> {
  return apiGet<StudentResultsResponse>("/student/portal/results");
}
