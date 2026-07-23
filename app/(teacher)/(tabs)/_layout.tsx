import { HapticTab } from "@/components/haptic-tab";
import { portalTabScreenOptions } from "@/components/navigation/portalTabOptions";
import { RoleColors } from "@/constants/school-theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const tint = RoleColors.teacher.tabActive;

export default function TeacherTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...portalTabScreenOptions("teacher"),
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          borderTopColor: "#E2E8F0",
          paddingTop: 4,
        },
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "Classes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="easel-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Work",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reader-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
