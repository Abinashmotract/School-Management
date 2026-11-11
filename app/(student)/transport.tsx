import { ScreenShell } from "@/components/navigation/ScreenShell";
import { RoleColors } from "@/constants/school-theme";
import { usePortalScreenStyles } from "@/hooks/use-portal-screen-styles";
import { fetchStudentTransport, type TransportAllocation } from "@/lib/student-portal-api";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";

const primary = RoleColors.student.primary;

function Row({ label, value }: { label: string; value?: string }) {
  const styles = usePortalScreenStyles();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.cardTitle}>{value || "—"}</Text>
    </View>
  );
}

export default function StudentTransportScreen() {
  const styles = usePortalScreenStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<TransportAllocation | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRow(await fetchStudentTransport());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load transport.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell role="student" title="Transport" showBack showMenu>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={primary} /></View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        >
          <Text style={styles.sub}>Your bus route, stop, and timings</Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {!row ? <Text style={styles.empty}>No transport allocation is saved for your account.</Text> : (
            <View style={styles.cardBlock}>
              <Row label="Route" value={row.routeName} />
              <Row label="Pickup stop" value={row.stopName} />
              <Row label="Drop stop" value={row.dropStopName} />
              <Row label="Pickup time" value={row.pickupTime} />
              <Row label="Drop time" value={row.dropTime} />
              <Row label="Vehicle" value={row.vehicleNumber} />
              <Row label="Seat" value={row.seatNumber} />
            </View>
          )}
        </ScrollView>
      )}
    </ScreenShell>
  );
}
