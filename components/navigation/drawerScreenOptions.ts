import type { ColorScheme } from '@/constants/school-theme';
import { getThemeColors } from '@/constants/school-theme';
import { Dimensions, Platform } from 'react-native';

export const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.84, 320);

export function createDrawerScreenOptions(scheme: ColorScheme) {
  const colors = getThemeColors(scheme);

  return {
    headerShown: false as const,
    drawerType: 'front' as const,
    drawerStyle: {
      width: DRAWER_WIDTH,
      backgroundColor: colors.drawer,
      borderTopRightRadius: Platform.OS === 'ios' ? 24 : 20,
      borderBottomRightRadius: Platform.OS === 'ios' ? 24 : 20,
      overflow: 'hidden' as const,
    },
    overlayColor: colors.overlay,
    swipeEdgeWidth: 48,
    drawerActiveBackgroundColor: 'transparent',
    drawerInactiveBackgroundColor: 'transparent',
    sceneContainerStyle: {
      backgroundColor: colors.bg,
    },
  };
}
