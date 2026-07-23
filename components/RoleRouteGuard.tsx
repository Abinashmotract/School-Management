import { useAppSelector } from "@/store/hooks";
import { Redirect } from "expo-router";
import type { ReactNode } from "react";

type Role = "student" | "parent" | "teacher";

export function RoleRouteGuard({
  expectedRole,
  children,
}: {
  expectedRole: Role;
  children: ReactNode;
}) {
  const { isHydrated, role } = useAppSelector((s) => s.auth);

  if (!isHydrated) return null;

  if (!role) {
    return <Redirect href="/login" />;
  }

  if (role !== expectedRole) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
