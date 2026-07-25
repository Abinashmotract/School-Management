import type { AppRole } from "@/constants/school-theme";
import { RoleColors } from "@/constants/school-theme";
import { resolveUserDisplayName } from "@/lib/drawer-profile";
import { fetchPortalInstitution, persistInstitutionName } from "@/lib/portal-institution-api";
import { fetchStudentProfile } from "@/lib/student-portal-api";
import { useAppTheme } from "@/providers/AppThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, patchUser } from "@/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { LinearGradient } from "@/components/ui/LinearGradient";
import { router, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DrawerItem = {
  label: string;
  href: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type DrawerSection = {
  title: string;
  items: DrawerItem[];
};

const studentSections: DrawerSection[] = [
  {
    title: "Main",
    items: [
      { label: "Home", href: "/(student)/(tabs)", icon: "home-outline" },
      { label: "Syllabus", href: "/(student)/(tabs)/study", icon: "book-outline" },
      { label: "Homework", href: "/(student)/(tabs)/homework", icon: "create-outline" },
      { label: "Attendance", href: "/(student)/(tabs)/attendance", icon: "calendar-outline" },
      { label: "Timetable", href: "/(student)/(tabs)/activities", icon: "time-outline" },
      { label: "Teachers", href: "/(student)/(tabs)/teachers", icon: "people-outline" },
      { label: "Results", href: "/(student)/results", icon: "ribbon-outline" },
      { label: "Fees", href: "/(student)/(tabs)/tasks", icon: "cash-outline" },
    ],
  },
  {
    title: "Updates",
    items: [
      { label: "Notices", href: "/(student)/notices", icon: "megaphone-outline" },
      { label: "Events", href: "/(student)/events", icon: "sparkles-outline" },
      { label: "Chat", href: "/(student)/(tabs)/chat", icon: "chatbubbles-outline" },
      { label: "Notifications", href: "/(student)/notifications", icon: "notifications-outline" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/(student)/(tabs)/profile", icon: "person-outline" },
      { label: "Settings", href: "/(student)/settings", icon: "settings-outline" },
      { label: "My Access", href: "/(student)/access", icon: "key-outline" },
      { label: "About Us", href: "/(student)/about", icon: "information-circle-outline" },
    ],
  },
];

const parentSections: DrawerSection[] = [
  {
    title: "Main",
    items: [
      { label: "Home", href: "/(parent)/(tabs)", icon: "home-outline" },
      { label: "Children", href: "/(parent)/(tabs)/children", icon: "people-outline" },
      { label: "Messages", href: "/(parent)/(tabs)/messages", icon: "chatbubbles-outline" },
      { label: "Notifications", href: "/(parent)/notifications", icon: "notifications-outline" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/(parent)/(tabs)/profile", icon: "person-outline" },
      { label: "Settings", href: "/(parent)/(tabs)/settings", icon: "settings-outline" },
      { label: "About Us", href: "/(parent)/about", icon: "information-circle-outline" },
    ],
  },
];

const teacherSections: DrawerSection[] = [
  {
    title: "Teaching",
    items: [
      { label: "Home", href: "/(teacher)/(tabs)", icon: "home-outline" },
      { label: "Classes", href: "/(teacher)/(tabs)/classes", icon: "easel-outline" },
      { label: "Students", href: "/(teacher)/(tabs)/students", icon: "people-outline" },
      { label: "Work", href: "/(teacher)/(tabs)/tasks", icon: "reader-outline" },
      { label: "Homework", href: "/(teacher)/homework", icon: "create-outline" },
      { label: "Mark Attendance", href: "/(teacher)/attendance", icon: "checkbox-outline" },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Chat", href: "/(teacher)/(tabs)/chat", icon: "chatbubbles-outline" },
      { label: "Notifications", href: "/(teacher)/notifications", icon: "notifications-outline" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/(teacher)/(tabs)/profile", icon: "person-outline" },
      { label: "Settings", href: "/(teacher)/settings", icon: "settings-outline" },
      { label: "About Us", href: "/(teacher)/about", icon: "information-circle-outline" },
    ],
  },
];

const sectionsByRole: Record<AppRole, DrawerSection[]> = {
  student: studentSections,
  parent: parentSections,
  teacher: teacherSections,
};

const roleFallbackName: Record<AppRole, string> = {
  student: "Student",
  parent: "Parent",
  teacher: "Teacher",
};

function normalizePath(path: string) {
  return path.replace(/\/$/, "");
}

function isActiveRoute(currentPath: string, href: string) {
  const current = normalizePath(currentPath);
  const target = normalizePath(href);
  if (current === target) return true;
  if (target.endsWith("/(tabs)") && current.includes("/(tabs)")) {
    return current.endsWith("/(tabs)") || current.endsWith("/(tabs)/index");
  }
  return current.startsWith(`${target}/`);
}

export function RoleDrawerContent({
  role,
  ...props
}: DrawerContentComponentProps & { role: AppRole }) {
  const navRouter = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { colors, isDark, toggleColorScheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>(() => {
    const cached = user?.institutionName;
    return typeof cached === "string" && cached.trim() ? cached.trim() : "";
  });

  const accent = RoleColors[role];
  const sections = sectionsByRole[role];
  const userName = profileName || resolveUserDisplayName(user, roleFallbackName[role]);
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  useEffect(() => {
    let cancelled = false;

    void fetchPortalInstitution().then((institution) => {
      if (cancelled || !institution?.name?.trim()) return;
      const name = institution.name.trim();
      setSchoolName(name);
      dispatch(patchUser({ institutionName: name }));
      void persistInstitutionName(name);
    });

    if (role === "student") {
      void fetchStudentProfile()
        .then((profile) => {
          if (cancelled) return;
          const basic = profile.basicInformation;
          const name = [basic?.firstName, basic?.middleName, basic?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (name) setProfileName(name);
        })
        .catch(() => undefined);
    } else {
      setProfileName(null);
    }

    return () => {
      cancelled = true;
    };
  }, [dispatch, role, user?.username]);

  const headerSubtitle = useMemo(() => {
    if (userName) return `${roleLabel} · ${userName}`;
    return roleLabel;
  }, [roleLabel, userName]);

  return (
    <View style={[styles.root, { backgroundColor: colors.drawer }]}>
      <LinearGradient
        colors={[accent.primary, accent.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + 18 }]}
      >
        <View style={styles.heroIconWrap}>
          <Ionicons name="school" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.heroSchool} numberOfLines={2}>
          {schoolName || "Loading school..."}
        </Text>
        <Text style={styles.heroUser} numberOfLines={1}>
          {headerSubtitle}
        </Text>
      </LinearGradient>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scroll}
        style={styles.drawerScroll}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.drawerSection }]}>
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Animated.View
                  key={item.href}
                  entering={FadeInDown.delay((sectionIndex * 4 + itemIndex) * 35).springify()}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.row,
                      {
                        backgroundColor: active
                          ? `${accent.primary}${isDark ? "33" : "18"}`
                          : pressed
                            ? colors.pressed
                            : "transparent",
                      },
                    ]}
                    onPress={() => {
                      props.navigation.closeDrawer();
                      navRouter.push(item.href as never);
                    }}
                  >
                    <View
                      style={[
                        styles.iconBubble,
                        {
                          backgroundColor: active
                            ? `${accent.primary}${isDark ? "44" : "22"}`
                            : isDark
                              ? "#1F2937"
                              : "#F8FAFC",
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={active ? accent.primary : colors.drawerMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.rowLabel,
                        {
                          color: active ? colors.text : colors.drawerMuted,
                          fontWeight: active ? "700" : "500",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {active ? (
                      <View style={[styles.activeDot, { backgroundColor: accent.primary }]} />
                    ) : null}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </DrawerContentScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.drawerBorder,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.footerAction,
            { backgroundColor: pressed ? colors.pressed : isDark ? "#1F2937" : "#F8FAFC" },
          ]}
          onPress={() => void toggleColorScheme()}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={20}
            color={colors.text}
          />
          <Text style={[styles.footerActionText, { color: colors.text }]}>
            {isDark ? "Light mode" : "Dark mode"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.footerAction,
            styles.logoutAction,
            { backgroundColor: pressed ? "#FEE2E2" : isDark ? "#3F1D1D" : "#FEF2F2" },
          ]}
          onPress={() => {
            props.navigation.closeDrawer();
            void dispatch(logout()).then(() => {
              router.replace("/login");
            });
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.footerActionText, { color: colors.danger }]}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  drawerScroll: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },
  heroSchool: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 26,
  },
  heroUser: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 10,
    marginBottom: 4,
    borderRadius: 14,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  footerActionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  logoutAction: {
    marginTop: 0,
  },
});
