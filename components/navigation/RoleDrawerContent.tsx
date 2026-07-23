import type { AppRole } from "@/constants/school-theme";
import { RoleColors } from "@/constants/school-theme";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DrawerItem = {
  label: string;
  href: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const menus: Record<AppRole, DrawerItem[]> = {
  student: [
    {
      label: "Home",
      href: "/(student)/(tabs)",
      icon: "home-outline",
    },
    {
      label: "Syllabus",
      href: "/(student)/(tabs)/study",
      icon: "book-outline",
    },
    {
      label: "Attendance",
      href: "/(student)/(tabs)/attendance",
      icon: "calendar-outline",
    },
    {
      label: "Timetable",
      href: "/(student)/(tabs)/activities",
      icon: "time-outline",
    },
    {
      label: "Teachers",
      href: "/(student)/(tabs)/teachers",
      icon: "people-outline",
    },
    {
      label: "Homework",
      href: "/(student)/(tabs)/homework",
      icon: "create-outline",
    },
    {
      label: "Results",
      href: "/(student)/results",
      icon: "ribbon-outline",
    },
    {
      label: "Notices",
      href: "/(student)/notices",
      icon: "megaphone-outline",
    },
    {
      label: "Events",
      href: "/(student)/events",
      icon: "calendar-outline",
    },
    {
      label: "Chat",
      href: "/(student)/(tabs)/chat",
      icon: "chatbubbles-outline",
    },
    {
      label: "Notifications",
      href: "/(student)/notifications",
      icon: "notifications-outline",
    },
    {
      label: "Fees",
      href: "/(student)/(tabs)/tasks",
      icon: "cash-outline",
    },
    {
      label: "Profile",
      href: "/(student)/(tabs)/profile",
      icon: "person-outline",
    },
    {
      label: "Settings",
      href: "/(student)/settings",
      icon: "settings-outline",
    },
    { label: "My Access", href: "/(student)/access", icon: "key-outline" },
    {
      label: "About Us",
      href: "/(student)/about",
      icon: "information-circle-outline",
    },
    {
      label: "Terms & Conditions",
      href: "/(student)/terms",
      icon: "document-text-outline",
    },
    {
      label: "Privacy Policy",
      href: "/(student)/privacy",
      icon: "shield-checkmark-outline",
    },
  ],
  parent: [
    {
      label: "Home",
      href: "/(parent)/(tabs)",
      icon: "home-outline",
    },
    {
      label: "Children",
      href: "/(parent)/(tabs)/children",
      icon: "people-outline",
    },
    {
      label: "Messages",
      href: "/(parent)/(tabs)/messages",
      icon: "chatbubbles-outline",
    },
    {
      label: "Notifications",
      href: "/(parent)/notifications",
      icon: "notifications-outline",
    },
    {
      label: "Profile",
      href: "/(parent)/(tabs)/profile",
      icon: "person-outline",
    },
    {
      label: "Settings",
      href: "/(parent)/(tabs)/settings",
      icon: "settings-outline",
    },
    {
      label: "About Us",
      href: "/(parent)/about",
      icon: "information-circle-outline",
    },
    {
      label: "Terms & Conditions",
      href: "/(parent)/terms",
      icon: "document-text-outline",
    },
    {
      label: "Privacy Policy",
      href: "/(parent)/privacy",
      icon: "shield-checkmark-outline",
    },
  ],
  teacher: [
    {
      label: "Home",
      href: "/(teacher)/(tabs)",
      icon: "home-outline",
    },
    {
      label: "Classes",
      href: "/(teacher)/(tabs)/classes",
      icon: "easel-outline",
    },
    {
      label: "Students",
      href: "/(teacher)/(tabs)/students",
      icon: "people-outline",
    },
    {
      label: "Work",
      href: "/(teacher)/(tabs)/tasks",
      icon: "reader-outline",
    },
    {
      label: "Homework",
      href: "/(teacher)/homework",
      icon: "create-outline",
    },
    {
      label: "Mark Attendance",
      href: "/(teacher)/attendance",
      icon: "checkbox-outline",
    },
    {
      label: "Chat",
      href: "/(teacher)/(tabs)/chat",
      icon: "chatbubbles-outline",
    },
    {
      label: "Notifications",
      href: "/(teacher)/notifications",
      icon: "notifications-outline",
    },
    {
      label: "Profile",
      href: "/(teacher)/(tabs)/profile",
      icon: "person-outline",
    },
    {
      label: "Settings",
      href: "/(teacher)/settings",
      icon: "settings-outline",
    },
    {
      label: "About Us",
      href: "/(teacher)/about",
      icon: "information-circle-outline",
    },
    {
      label: "Terms & Conditions",
      href: "/(teacher)/terms",
      icon: "document-text-outline",
    },
    {
      label: "Privacy Policy",
      href: "/(teacher)/privacy",
      icon: "shield-checkmark-outline",
    },
  ],
};

const titles: Record<AppRole, string> = {
  student: "SchoolApp",
  parent: "SchoolApp",
  teacher: "SchoolApp",
};

export function RoleDrawerContent({
  role,
  ...props
}: DrawerContentComponentProps & { role: AppRole }) {
  const navRouter = useRouter();
  const dispatch = useAppDispatch();
  const c = RoleColors[role];
  const items = menus[role];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scroll}
      style={styles.drawer}
    >
      <View style={styles.logoRow}>
        <View style={[styles.logoIcon, { backgroundColor: `${c.primary}18` }]}>
          <Ionicons name="school" size={26} color={c.primary} />
        </View>
        <Text style={styles.logoTitle}>{titles[role]}</Text>
      </View>

      {items.map((item) => (
        <Pressable
          key={item.href}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => {
            props.navigation.closeDrawer();
            navRouter.push(item.href as never);
          }}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color="#666"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>{item.label}</Text>
        </Pressable>
      ))}

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.logout, pressed && styles.rowPressed]}
          onPress={() => {
            props.navigation.closeDrawer();
            void dispatch(logout()).then(() => {
              router.replace("/login");
            });
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
    marginBottom: 8,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  rowPressed: {
    backgroundColor: "#F2F2F7",
  },
  rowIcon: {
    width: 28,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
    paddingHorizontal: 16,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
