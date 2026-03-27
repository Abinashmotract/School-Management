export type AppRole = 'student' | 'parent' | 'teacher';

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

export const Neutrals = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1E293B',
  muted: '#64748B',
  border: '#E2E8F0',
};
