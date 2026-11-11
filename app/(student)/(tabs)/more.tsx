import { RoleColors } from "@/constants/school-theme";
import { usePortalScreenStyles } from "@/hooks/use-portal-screen-styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const primary = RoleColors.student.primary;

const items: { label: string; hint: string; href: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { label: "Syllabus", hint: "Lesson plans and study material", href: "/(student)/(tabs)/study", icon: "book-outline" },
  { label: "Homework", hint: "Assignments, files, and feedback", href: "/(student)/(tabs)/homework", icon: "create-outline" },
  { label: "Timetable", hint: "Today's class schedule", href: "/(student)/(tabs)/activities", icon: "time-outline" },
  { label: "Teachers", hint: "Class and subject teachers", href: "/(student)/(tabs)/teachers", icon: "people-outline" },
  { label: "Exam dates", hint: "Date sheet before results", href: "/(student)/exams", icon: "calendar-outline" },
  { label: "Results", hint: "Report card and marks", href: "/(student)/results", icon: "ribbon-outline" },
  { label: "Notices", hint: "School announcements", href: "/(student)/notices", icon: "megaphone-outline" },
  { label: "Events", hint: "School calendar", href: "/(student)/events", icon: "sparkles-outline" },
  { label: "Chat", hint: "Messages", href: "/(student)/(tabs)/chat", icon: "chatbubbles-outline" },
  { label: "Transport", hint: "Route, stop, and timings", href: "/(student)/transport", icon: "bus-outline" },
  { label: "Library", hint: "Issued books and due dates", href: "/(student)/library", icon: "library-outline" },
  { label: "Leave", hint: "Apply and track leave", href: "/(student)/leave", icon: "medkit-outline" },
  { label: "ID card", hint: "Your student card", href: "/(student)/id-card", icon: "card-outline" },
];

export default function StudentMoreScreen() {
  const styles = usePortalScreenStyles();
  const router = useRouter();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.sub}>Syllabus, exams, transport, library, and your ID card</Text>
      {items.map((item) => (
        <Pressable key={item.href} style={styles.card} onPress={() => router.push(item.href as never)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name={item.icon} size={22} color={primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.muted}>{item.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={primary} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
