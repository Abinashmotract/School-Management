import { apiGet, getAuthUser, getInstitutionId } from '@/lib/api-client';
import * as SecureStore from 'expo-secure-store';

export type PortalInstitution = {
  institutionId?: string;
  name?: string;
  logo?: string;
  faviconUrl?: string;
  portalPageTitle?: string;
};

const SK_USER = 'auth_user_json';

export async function fetchPortalInstitution(): Promise<PortalInstitution | null> {
  const institutionId = getInstitutionId();
  if (!institutionId) return null;

  try {
    const response = await apiGet<PortalInstitution | { data?: PortalInstitution }>(
      `/institute/${institutionId}/get`,
    );

    const institution =
      response && typeof response === 'object' && 'data' in response
        ? (response as { data?: PortalInstitution }).data
        : (response as PortalInstitution);

    if (!institution?.name?.trim()) return null;
    return institution;
  } catch {
    return null;
  }
}

export async function persistInstitutionName(name: string) {
  const user = getAuthUser();
  if (!user) return;
  const next = { ...user, institutionName: name.trim() };
  await SecureStore.setItemAsync(SK_USER, JSON.stringify(next));
}
