import type { AppRole } from "@/constants/school-theme";
import { AppScreenHeader } from "@/components/navigation/AppScreenHeader";

type Props = {
  title: string;
  role: AppRole;
};

/** @deprecated Use ScreenShell or AppScreenHeader directly */
export function DrawerSubHeader({ title, role = "student" }: Props) {
  return (
    <AppScreenHeader
      role={role}
      title={title}
      showBack
      showMenu
      showNotifications
    />
  );
}
