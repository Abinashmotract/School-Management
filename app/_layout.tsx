import { useAppDispatch } from '@/store/hooks';
import { hydrateAuth } from '@/store/slices/authSlice';
import { store } from '@/store/index';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { RoleThemeSync } from '@/components/RoleThemeSync';
import { AppThemeProvider } from '@/providers/AppThemeProvider';

function AuthHydrate() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppThemeProvider>
          <AuthHydrate />
          <RoleThemeSync />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AppThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
