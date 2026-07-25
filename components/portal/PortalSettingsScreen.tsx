import type { AppRole } from "@/constants/school-theme";
import {
  loadPortalSettings,
  savePortalSettings,
  type PortalSettings,
} from "@/lib/settings-storage";
import { useAppTheme } from "@/providers/AppThemeProvider";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

type Props = {
  role: AppRole;
  extraSections?: React.ReactNode;
};

export default function PortalSettingsScreen({ role, extraSections }: Props) {
  const { colors, isDark, setColorScheme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PortalSettings | null>(null);

  useEffect(() => {
    void loadPortalSettings(role).then((value) => {
      setSettings({ ...value, darkMode: isDark });
      setLoading(false);
    });
  }, [role, isDark]);

  const update = useCallback(
    async (patch: Partial<PortalSettings>) => {
      setSettings((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        void savePortalSettings(role, next);
        return next;
      });

      if (patch.darkMode !== undefined) {
        await setColorScheme(patch.darkMode ? "dark" : "light");
      }
    },
    [role, setColorScheme]
  );

  if (loading || !settings) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.section, { color: colors.muted }]}>Notifications</Text>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Push notifications</Text>
        <Switch
          value={settings.pushNotifications}
          onValueChange={(value) => void update({ pushNotifications: value })}
        />
      </View>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <Switch
          value={settings.emailNotifications}
          onValueChange={(value) => void update({ emailNotifications: value })}
        />
      </View>

      <Text style={[styles.section, { color: colors.muted }]}>Appearance</Text>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <View style={styles.appearanceCopy}>
          <Text style={[styles.label, { color: colors.text }]}>Dark mode</Text>
          <Text style={[styles.helper, { color: colors.muted }]}>
            Switch between light and dark themes instantly.
          </Text>
        </View>
        <Switch
          value={settings.darkMode}
          onValueChange={(value) => void update({ darkMode: value })}
        />
      </View>

      {extraSections}

      <Text style={[styles.hint, { color: colors.muted }]}>
        Preferences are saved on this device and apply across the app.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  appearanceCopy: {
    flex: 1,
    paddingRight: 12,
  },
  label: { fontSize: 15, fontWeight: "600" },
  helper: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  hint: { fontSize: 12, marginTop: 16, lineHeight: 18 },
});
