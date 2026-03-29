import { useAppSelector } from '@/store/hooks';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const rolePaths = {
  student: '/(student)/(tabs)',
  parent: '/(parent)/(tabs)',
  teacher: '/(teacher)/(tabs)',
} as const;

export default function Index() {
  const { isHydrated, role } = useAppSelector((s) => s.auth);
  const isLoggedIn = role !== null;

  if (!isHydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isLoggedIn && role) {
    return <Redirect href={rolePaths[role] as never} />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
