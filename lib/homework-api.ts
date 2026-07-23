import { apiGet, apiPost } from "@/lib/api-client";

export type HomeworkSubmission = {
  studentId?: string;
  studentName?: string;
  submittedAt?: string;
  attachmentUrl?: string;
  content?: string;
  marks?: number | null;
  feedback?: string;
  status?: string;
};

export type HomeworkAssignment = {
  homeworkId: string;
  title: string;
  description?: string;
  subjectName?: string;
  className?: string;
  sectionName?: string;
  teacherName?: string;
  assignedDate?: string;
  dueDate?: string;
  attachmentUrl?: string;
  status?: string;
  mySubmission?: HomeworkSubmission | null;
};

export async function fetchStudentHomework(session?: string): Promise<HomeworkAssignment[]> {
  const response = await apiGet<{ assignments?: HomeworkAssignment[] }>(
    "/student/portal/homework",
    { session }
  );
  return response?.assignments || [];
}

export async function submitHomework(
  homeworkId: string,
  payload: { content?: string; attachmentUrl?: string }
) {
  return apiPost<{ message?: string; assignment?: HomeworkAssignment }>(
    `/student/portal/homework/${encodeURIComponent(homeworkId)}/submit`,
    payload
  );
}
