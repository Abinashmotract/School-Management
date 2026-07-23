import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { HomeworkAssignment, HomeworkSubmission } from "@/lib/homework-api";

export type TeacherHomeworkAssignment = HomeworkAssignment & {
  homeworkId: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  submissions?: HomeworkSubmission[];
};

export async function fetchTeacherHomework(): Promise<TeacherHomeworkAssignment[]> {
  const response = await apiGet<{ assignments?: TeacherHomeworkAssignment[] }>("/homework/my");
  return response?.assignments || [];
}

export async function createHomework(payload: {
  title: string;
  description?: string;
  classId: string;
  className?: string;
  sectionId: string;
  sectionName?: string;
  subjectId?: string;
  subjectName?: string;
  dueDate?: string;
  attachmentUrl?: string;
}) {
  return apiPost<{ message?: string; assignment?: TeacherHomeworkAssignment }>(
    "/homework",
    payload
  );
}

export async function updateHomework(
  homeworkId: string,
  payload: Partial<{
    title: string;
    description: string;
    dueDate: string;
    status: "ACTIVE" | "CLOSED";
  }>
) {
  return apiPut<{ message?: string; assignment?: TeacherHomeworkAssignment }>(
    `/homework/${encodeURIComponent(homeworkId)}`,
    payload
  );
}

export async function gradeHomework(
  homeworkId: string,
  payload: { studentId: string; studentName?: string; marks: number; feedback?: string }
) {
  return apiPost<{ message?: string; assignment?: TeacherHomeworkAssignment }>(
    `/homework/${encodeURIComponent(homeworkId)}/grade`,
    payload
  );
}
