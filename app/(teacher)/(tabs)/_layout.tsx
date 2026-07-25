import { HapticTab } from "@/components/haptic-tab";
import { usePortalTabScreenOptions } from "@/components/navigation/portalTabOptions";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TeacherTabsLayout() {
  const screenOptions = usePortalTabScreenOptions("teacher");

  return (
    <Tabs
      screenOptions={{
        ...screenOptions,
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
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Work",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reader-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
