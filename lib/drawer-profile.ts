import type { AuthUser } from "@/store/slices/authSlice";

export function resolveSchoolName(user: AuthUser | null): string {
  if (!user) return "School";
  const name = user.institutionName ?? user.schoolName ?? user.instituteName;
  if (typeof name === "string" && name.trim()) return name.trim();
  return "School";
}

export function resolveUserDisplayName(user: AuthUser | null, fallback = "User"): string {
  if (!user) return fallback;

  const first = String(user.firstName ?? "").trim();
  const middle = String(user.middleName ?? "").trim();
  const last = String(user.lastName ?? "").trim();
  const full = [first, middle, last].filter(Boolean).join(" ").trim();
  if (full) return full;

  const single = user.name ?? user.fullName ?? user.displayName;
  if (typeof single === "string" && single.trim()) return single.trim();

  const username = user.username;
  if (typeof username === "string" && username.trim()) return username.trim();

  return fallback;
}

export function withInstitutionUser(
  user: Record<string, unknown>,
  institution?: Record<string, unknown> | null,
): AuthUser {
  const institutionName =
    (typeof institution?.name === "string" && institution.name.trim()) ||
    (typeof user.institutionName === "string" && user.institutionName.trim()) ||
    "";

  return {
    ...user,
    institutionId: user.institutionId ?? institution?.institutionId,
    institutionName,
  };
}
