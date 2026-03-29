import { API_BASE_URL } from "@/lib/config";
import { store } from "@/store/index";

function headers(): HeadersInit {
  const token = store.getState().auth.accessToken;
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

const base = () => API_BASE_URL.replace(/\/$/, "");

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(text.slice(0, 120) || "Invalid response");
    }
  }
  if (!res.ok) {
    const msg =
      data &&
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export type PortalOverview = {
  session: string;
  className: string;
  sectionName: string;
  medium: string;
  studentName: string;
};

export async function fetchPortalOverview(session?: string): Promise<PortalOverview> {
  const q = session ? `?session=${encodeURIComponent(session)}` : "";
  const res = await fetch(`${base()}/student-portal/overview${q}`, {
    headers: headers(),
  });
  return parseJson<PortalOverview>(res);
}

export type SyllabusRow = {
  _id: string;
  subjectName: string;
  title: string;
  description?: string;
  resourceUrl?: string;
  order?: number;
};

export async function fetchSyllabus(session?: string): Promise<SyllabusRow[]> {
  const q = session ? `?session=${encodeURIComponent(session)}` : "";
  const res = await fetch(`${base()}/student-portal/syllabus${q}`, {
    headers: headers(),
  });
  return parseJson<SyllabusRow[]>(res);
}

export type ActivityRow = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  startsAt: string;
  endsAt?: string;
  venue?: string;
};

export async function fetchActivities(session?: string): Promise<ActivityRow[]> {
  const q = session ? `?session=${encodeURIComponent(session)}` : "";
  const res = await fetch(`${base()}/student-portal/activities${q}`, {
    headers: headers(),
  });
  return parseJson<ActivityRow[]>(res);
}

export type TaskRow = {
  _id: string;
  subjectName: string;
  title: string;
  description?: string;
  dueDate: string;
  myStatus?: string;
  mySubmittedAt?: string;
};

export async function fetchTasks(session?: string): Promise<TaskRow[]> {
  const q = session ? `?session=${encodeURIComponent(session)}` : "";
  const res = await fetch(`${base()}/student-portal/tasks${q}`, {
    headers: headers(),
  });
  return parseJson<TaskRow[]>(res);
}

export async function completeTask(taskId: string, note?: string): Promise<void> {
  const res = await fetch(`${base()}/student-portal/tasks/${taskId}/complete`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ note: note || "" }),
  });
  await parseJson(res);
}
