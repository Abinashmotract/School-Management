import { ScreenShell } from '@/components/navigation/ScreenShell';
import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const primary = RoleColors.student.primary;

const useLocalStyles = createThemedStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 14, color: colors.muted, marginBottom: 16, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  itemText: { flex: 1, fontSize: 15, color: colors.text },
  itemDisabled: { color: colors.muted },
}));

const features = [
  {
    title: 'Academic',
    items: [
      { label: 'Timetable', href: '/(student)/(tabs)/activities', enabled: true },
      { label: 'Study plan / Syllabus', href: '/(student)/(tabs)/study', enabled: true },
      { label: 'Homework', href: '/(student)/(tabs)/homework', enabled: true },
      { label: 'Exam results', href: '/(student)/results', enabled: true },
      { label: 'Attendance', href: '/(student)/(tabs)/attendance', enabled: true },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Chat', href: '/(student)/(tabs)/chat', enabled: true },
      { label: 'Notifications', href: '/(student)/notifications', enabled: true },
      { label: 'Notices', href: '/(student)/notices', enabled: true },
      { label: 'Events', href: '/(student)/events', enabled: true },
      { label: 'Teachers directory', href: '/(student)/(tabs)/teachers', enabled: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Fees & payments', href: '/(student)/(tabs)/tasks', enabled: true },
      { label: 'Profile', href: '/(student)/(tabs)/profile', enabled: true },
      { label: 'Settings', href: '/(student)/settings', enabled: true },
    ],
  },
];

export default function StudentAccessScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const router = useRouter();

  return (
    <ScreenShell role="student" title="My Access" showBack showMenu>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Features available on your student account. Tap any item to open it.
        </Text>
        {features.map((block) => (
          <View key={block.title} style={styles.card}>
            <Text style={styles.cardTitle}>{block.title}</Text>
            {block.items.map((item) => (
              <Pressable
                key={item.label}
                style={styles.itemRow}
                onPress={() => router.push(item.href as never)}
              >
                <Ionicons
                  name={item.enabled ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={item.enabled ? primary : '#94A3B8'}
                />
                <Text style={[styles.itemText, !item.enabled && styles.itemDisabled]}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
