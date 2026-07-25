import { ScreenShell } from '@/components/navigation/ScreenShell';
import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const primary = RoleColors.teacher.primary;

const useLocalStyles = createThemedStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  hero: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  p: { fontSize: 15, lineHeight: 22, color: colors.muted },
}));

export default function TeacherAboutScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };

  return (
    <ScreenShell role="teacher" title="About Us" showBack showMenu>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: primary }]}>
          <Ionicons name="school" size={48} color="#fff" />
          <Text style={styles.heroTitle}>Built for educators</Text>
          <Text style={styles.heroSub}>
            Plan classes, track learners, and stay in sync with your school.
          </Text>
        </View>
        <Text style={styles.p}>
          SchoolApp helps teachers focus on teaching with streamlined assignments and communication.
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}
