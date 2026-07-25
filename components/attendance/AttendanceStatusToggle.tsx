import type { QuickAttendanceStatus } from "@/lib/attendance-utils";
import { useAppTheme } from "@/providers/AppThemeProvider";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const OPTIONS: { key: QuickAttendanceStatus; label: string; color: string }[] = [
  { key: "present", label: "P", color: "#16A34A" },
  { key: "absent", label: "A", color: "#DC2626" },
  { key: "late", label: "L", color: "#D97706" },
];

type Props = {
  value: QuickAttendanceStatus;
  onChange: (status: QuickAttendanceStatus) => void;
};

export function AttendanceStatusToggle({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const displayValue: QuickAttendanceStatus =
    value === "absent" || value === "late" ? value : "present";

  return (
    <View style={[styles.wrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
      {OPTIONS.map((option) => {
        const active = displayValue === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.btn,
              active && { backgroundColor: option.color, borderColor: option.color },
            ]}
          >
            <Text style={[styles.btnText, active && styles.btnTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  btn: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
  },
  btnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
  },
  btnTextActive: {
    color: "#FFFFFF",
  },
});
