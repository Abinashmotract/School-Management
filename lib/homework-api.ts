import { apiGet, apiPost } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/config";
import { store } from "@/store/index";

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

export async function uploadHomeworkFile(file: { uri: string; name: string; mimeType?: string }) {
  const token = store.getState().auth.accessToken;
  const form = new FormData();
  form.append("category", "homework");
  form.append("imageUrl", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/octet-stream",
  } as unknown as Blob);
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/misc/s3/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
    imageUrl?: string;
    url?: string;
    data?: { imageUrl?: string; url?: string };
  };
  if (!response.ok) {
    throw new Error(json.message || "Could not upload the file.");
  }
  const url = json.imageUrl || json.url || json.data?.imageUrl || json.data?.url;
  if (!url) throw new Error("Upload did not return a file link.");
  return String(url);
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
