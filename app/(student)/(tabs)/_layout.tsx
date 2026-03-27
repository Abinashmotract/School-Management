import { HapticTab } from "@/components/haptic-tab";
import { RoleColors } from "@/constants/school-theme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";

const tint = RoleColors.student.tabActive;

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <DrawerToggleButton
            tintColor="#1E293B"
            pressColor={Platform.OS === "android" ? `${tint}22` : undefined}
          />
        ),
        headerTitle: "SchoolApp",
        headerRight: () => (
          <Pressable
            onPress={() => {
              // Navigate to notifications
            }}
            style={{ paddingRight: 16 }}
          >
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          </Pressable>
        ),
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" },
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
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
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
