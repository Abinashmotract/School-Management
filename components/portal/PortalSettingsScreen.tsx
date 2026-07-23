import type { AppRole } from "@/constants/school-theme";
import { Neutrals } from "@/constants/school-theme";
import {
  loadPortalSettings,
  savePortalSettings,
  type PortalSettings,
} from "@/lib/settings-storage";
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
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PortalSettings | null>(null);

  useEffect(() => {
    void loadPortalSettings(role).then((value) => {
      setSettings(value);
      setLoading(false);
    });
  }, [role]);

  const update = useCallback(
    async (patch: Partial<PortalSettings>) => {
      setSettings((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        void savePortalSettings(role, next);
        return next;
      });
    },
    [role]
  );

  if (loading || !settings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Push notifications</Text>
        <Switch
          value={settings.pushNotifications}
          onValueChange={(value) => void update({ pushNotifications: value })}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <Switch
          value={settings.emailNotifications}
          onValueChange={(value) => void update({ emailNotifications: value })}
        />
      </View>

      <Text style={styles.section}>Appearance</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Dark mode</Text>
        <Switch
          value={settings.darkMode}
          onValueChange={(value) => void update({ darkMode: value })}
        />
      </View>

      {extraSections}

      <Text style={styles.hint}>
        Preferences are saved on this device. Dark mode applies when the app theme supports it.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Neutrals.bg },
  section: {
    fontSize: 13,
    fontWeight: "700",
    color: Neutrals.muted,
    marginTop: 8,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Neutrals.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  label: { fontSize: 15, color: Neutrals.text },
  hint: { fontSize: 12, color: Neutrals.muted, marginTop: 16, lineHeight: 18 },
});
