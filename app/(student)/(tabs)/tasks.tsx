import { Neutrals, RoleColors } from '@/constants/school-theme';
import { fetchStudentPaymentOptions } from '@/lib/payment-api';
import { fetchStudentProfile, type StudentProfile } from '@/lib/student-portal-api';
import { useFeePayment } from '@/lib/use-fee-payment';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

function money(value: unknown) {
  const n = Number(value || 0);
  return n ? `₹${n.toLocaleString('en-IN')}` : '—';
}

export default function StudentTasksScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<Awaited<ReturnType<typeof fetchStudentPaymentOptions>> | null>(null);
  const { paying, runPayment } = useFeePayment(paymentOptions);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchStudentProfile();
      setProfile(data);
      setPaymentOptions(
        await fetchStudentPaymentOptions(data.academicInformation?.session).catch(() => null)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load fees.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  const fees = profile?.feesInformation;
  const selectedFees = Array.isArray(fees?.selectedFees) ? fees.selectedFees : [];
  const pending = Number(paymentOptions?.feesDetails?.totalPendingAmount || 0);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <Text style={styles.title}>Fees</Text>
      <Text style={styles.sub}>Your fee group and payment information</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {!fees && !error ? (
        <Text style={styles.empty}>No fees information found for your account.</Text>
      ) : null}

      {fees ? (
        <>
          <View style={styles.summary}>
            <Ionicons name="cash-outline" size={26} color={primary} />
            <View>
              <Text style={styles.summaryValue}>{money(fees.totalAmount)}</Text>
              <Text style={styles.summaryLabel}>Total fee amount</Text>
            </View>
          </View>

          {pending > 0 ? (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingLabel}>Pending online</Text>
              <Text style={styles.pendingValue}>{money(pending)}</Text>
            </View>
          ) : null}

          {paymentOptions?.paymentEnabled && pending > 0 ? (
            <Pressable
              style={[styles.payBtn, paying && { opacity: 0.6 }]}
              disabled={paying}
              onPress={() =>
                void runPayment({ session: profile?.academicInformation?.session })
              }
            >
              {paying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="#fff" />
                  <Text style={styles.payBtnText}>Pay fees online</Text>
                </>
              )}
            </Pressable>
          ) : null}

          {[
            ['Session', fees.session || profile?.academicInformation?.session || '—'],
            ['Fee Group', fees.feesGroupId || '—'],
            ['Discount', money(fees.discountApplied)],
            ['Scholarship', fees.scholarshipApplied ? money(fees.scholarshipAmount) : 'Not applied'],
            ['Payment Mode', fees.paymentMode || '—'],
            ['Fee Heads', String(selectedFees.length)],
          ].map(([label, value]) => (
            <View key={label} style={styles.card}>
              <Text style={styles.cardSubject}>{label}</Text>
              <Text style={styles.cardTitle}>{value}</Text>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg },
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  sub: { fontSize: 14, color: Neutrals.muted, marginBottom: 16 },
  err: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: Neutrals.muted },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: `${primary}12`,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  summaryValue: { fontSize: 24, fontWeight: '700', color: Neutrals.text },
  summaryLabel: { fontSize: 13, color: Neutrals.muted },
  pendingBox: {
    backgroundColor: Neutrals.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: { fontSize: 14, color: Neutrals.muted },
  pendingValue: { fontSize: 18, fontWeight: '700', color: Neutrals.text },
  payBtn: {
    marginBottom: 14,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardSubject: { fontSize: 12, fontWeight: '700', color: primary, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Neutrals.text },
});
