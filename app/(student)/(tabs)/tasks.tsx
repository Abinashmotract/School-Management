import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { fetchStudentPaymentOptions } from '@/lib/payment-api';
import { fetchStudentProfile, type StudentProfile } from '@/lib/student-portal-api';
import { useFeePayment } from '@/lib/use-fee-payment';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  Pressable,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

const useLocalStyles = createThemedStyles((colors) => ({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: `${primary}12`,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  summaryValue: { fontSize: 24, fontWeight: '700', color: colors.text },
  summaryLabel: { fontSize: 13, color: colors.muted },
  pendingBox: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: { fontSize: 14, color: colors.muted },
  pendingValue: { fontSize: 18, fontWeight: '700', color: colors.text },
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
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardSubject: { fontSize: 12, fontWeight: '700', color: primary, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
}));

export default function StudentTasksScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
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

function money(value: unknown) {
  const n = Number(value || 0);
  return n ? `₹${n.toLocaleString('en-IN')}` : '—';
}
