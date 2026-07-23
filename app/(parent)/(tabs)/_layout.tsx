import { HapticTab } from "@/components/haptic-tab";
import { portalTabScreenOptions } from "@/components/navigation/portalTabOptions";
import { RoleColors } from "@/constants/school-theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const tint = RoleColors.parent.tabActive;

export default function ParentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...portalTabScreenOptions("parent"),
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
        name="children"
        options={{
          title: "Children",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
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
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
