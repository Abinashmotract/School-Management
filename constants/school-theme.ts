export type AppRole = 'student' | 'parent' | 'teacher';

export type ColorScheme = 'light' | 'dark';

export const RoleColors: Record<
  AppRole,
  { primary: string; primaryDark: string; tabActive: string; gradientEnd: string }
> = {
  student: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    tabActive: '#3B82F6',
    gradientEnd: '#8B5CF6',
  },
  parent: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    tabActive: '#F59E0B',
    gradientEnd: '#EA580C',
  },
  teacher: {
    primary: '#10B981',
    primaryDark: '#059669',
    tabActive: '#10B981',
    gradientEnd: '#059669',
  },
};

export type AppThemeColors = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  drawer: string;
  drawerBorder: string;
  drawerMuted: string;
  drawerSection: string;
  overlay: string;
  input: string;
  danger: string;
  success: string;
  header: string;
  tabBar: string;
  tabBarBorder: string;
  tabInactive: string;
  pressed: string;
  shadow: string;
};

export const LightTheme: AppThemeColors = {
  bg: '#F4F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  drawer: '#FFFFFF',
  drawerBorder: '#E8EDF5',
  drawerMuted: '#64748B',
  drawerSection: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.48)',
  input: '#F8FAFC',
  danger: '#EF4444',
  success: '#16A34A',
  header: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabInactive: '#94A3B8',
  pressed: '#F1F5F9',
  shadow: '#0F172A',
};

export const DarkTheme: AppThemeColors = {
  bg: '#0B1220',
  card: '#151F33',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#243049',
  drawer: '#111827',
  drawerBorder: '#1F2937',
  drawerMuted: '#94A3B8',
  drawerSection: '#64748B',
  overlay: 'rgba(0, 0, 0, 0.62)',
  input: '#1E293B',
  danger: '#F87171',
  success: '#4ADE80',
  header: '#111827',
  tabBar: '#111827',
  tabBarBorder: '#1F2937',
  tabInactive: '#64748B',
  pressed: '#1E293B',
  shadow: '#000000',
};

/** @deprecated Use useAppTheme().colors instead */
export const Neutrals = {
  bg: LightTheme.bg,
  card: LightTheme.card,
  text: LightTheme.text,
  muted: LightTheme.muted,
  border: LightTheme.border,
};

export function getThemeColors(scheme: ColorScheme): AppThemeColors {
  return scheme === 'dark' ? DarkTheme : LightTheme;
}
