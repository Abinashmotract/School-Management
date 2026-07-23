import { ScreenShell } from '@/components/navigation/ScreenShell';
import { Neutrals, RoleColors } from '@/constants/school-theme';
import { useFeePayment } from '@/lib/use-fee-payment';
import {
  attendancePercent,
  childClassLabel,
  childDisplayName,
  fetchChildAttendance,
  fetchChildFees,
  fetchChildResults,
  fetchChildTimetable,
  fetchParentChildren,
  type ParentChild,
  type ParentChildAttendance,
  type ParentChildFees,
  type ParentTimetableSlot,
} from '@/lib/parent-portal-api';
import { fetchChildPaymentOptions, type PaymentOptions } from '@/lib/payment-api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.parent.primary;

type TabKey = 'attendance' | 'fees' | 'results' | 'timetable';

function money(n?: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function ParentChildDetailScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [child, setChild] = useState<ParentChild | null>(null);
  const [tab, setTab] = useState<TabKey>('attendance');
  const [attendance, setAttendance] = useState<ParentChildAttendance | null>(null);
  const [fees, setFees] = useState<ParentChildFees | null>(null);
  const [results, setResults] = useState<unknown[]>([]);
  const [timetable, setTimetable] = useState<ParentTimetableSlot[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const { paying, runPayment } = useFeePayment(paymentOptions);

  const load = useCallback(async () => {
    if (!studentId) return;
    setError(null);
    try {
      const kids = await fetchParentChildren();
      const match = kids.find((c) => c.studentId === studentId) || null;
      setChild(match);

      const session = match?.session;
      const [att, fee, res, tt, payOpts] = await Promise.all([
        fetchChildAttendance(studentId, { session, days: 60 }).catch(() => null),
        fetchChildFees(studentId, session).catch(() => null),
        fetchChildResults(studentId).catch(() => ({ results: [] })),
        fetchChildTimetable(studentId, session).catch(() => []),
        fetchChildPaymentOptions(studentId, session).catch(() => null),
      ]);

      setAttendance(att);
      setFees(fee);
      setResults(Array.isArray(res?.results) ? res.results : []);
      setTimetable(Array.isArray(tt) ? tt : []);
      setPaymentOptions(payOpts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load child details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const rate = attendancePercent(attendance?.summary);
  const ttByDay = useMemo(() => {
    const map = new Map<string, ParentTimetableSlot[]>();
    timetable.forEach((slot) => {
      const day = slot.day || 'Other';
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(slot);
    });
    return [...map.entries()];
  }, [timetable]);

  if (loading) {
    return (
      <ScreenShell role="parent" title="Child Details" showBack showMenu>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ScreenShell>
    );
  }

  if (!child) {
    return (
      <ScreenShell role="parent" title="Child Details" showBack showMenu>
        <View style={styles.center}>
          <Text style={styles.err}>{error || 'Child not found.'}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go back</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      role="parent"
      title={childDisplayName(child)}
      subtitle={childClassLabel(child)}
      showBack
      showMenu
    >
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: `${primary}22` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>
            {childDisplayName(child).charAt(0).toUpperCase()}
          </Text>
        </View>
        {child.admissionNumber ? (
          <Text style={styles.heroMeta}>Admission no. {child.admissionNumber}</Text>
        ) : null}
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <View style={styles.tabs}>
        {([
          ['attendance', 'Attendance'],
          ['fees', 'Fees'],
          ['results', 'Results'],
          ['timetable', 'Timetable'],
        ] as const).map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'attendance' ? (
        <View style={styles.panel}>
          <InfoRow label="Rate (60 days)" value={rate != null ? `${rate}%` : 'No data'} />
          <InfoRow label="Present" value={String(attendance?.summary?.present ?? 0)} />
          <InfoRow label="Absent" value={String(attendance?.summary?.absent ?? 0)} />
          <InfoRow label="Late" value={String(attendance?.summary?.late ?? 0)} />
          <InfoRow label="Leave" value={String(attendance?.summary?.leave ?? 0)} />
          <Text style={styles.subSection}>Recent records</Text>
          {(attendance?.records || []).slice(0, 15).map((row) => (
            <View key={`${row.date}-${row._id || row.statusKey}`} style={styles.listRow}>
              <Text style={styles.listTitle}>{row.date}</Text>
              <Text style={styles.listMeta}>{row.statusKey || '—'}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'fees' ? (
        <View style={styles.panel}>
          {fees ? (
            <>
              <InfoRow label="Assigned" value={money(fees.summary.totalAssigned)} />
              <InfoRow label="Discount" value={money(fees.summary.totalDiscount)} />
              <InfoRow label="Paid" value={money(fees.summary.totalPaid)} />
              <InfoRow label="Balance" value={money(fees.summary.balance)} />

              {paymentOptions?.paymentEnabled && Number(fees.summary.balance) > 0 ? (
                <Pressable
                  style={[styles.payBtn, paying && { opacity: 0.6 }]}
                  disabled={paying}
                  onPress={() =>
                    void runPayment({ studentId: child.studentId, session: child.session })
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

              <Text style={styles.subSection}>Recent payments</Text>
              {(fees.recentPayments as { paymentDate?: string; totalPaid?: number; receiptNumber?: string }[]).length === 0 ? (
                <Text style={styles.muted}>No payments recorded.</Text>
              ) : null}
              {(fees.recentPayments as { paymentDate?: string; totalPaid?: number; receiptNumber?: string }[]).map((p, i) => (
                <View key={`${p.paymentDate}-${i}`} style={styles.listRow}>
                  <Text style={styles.listTitle}>{p.paymentDate || 'Payment'}</Text>
                  <Text style={styles.listMeta}>
                    {money(Number(p.totalPaid || 0))}
                    {p.receiptNumber ? ` · ${p.receiptNumber}` : ''}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.muted}>Fee details unavailable.</Text>
          )}
        </View>
      ) : null}

      {tab === 'results' ? (
        <View style={styles.panel}>
          {results.length === 0 ? (
            <Text style={styles.muted}>No exam results published yet.</Text>
          ) : null}
          {results.map((row, i) => {
            const item = row as Record<string, unknown>;
            const subject = String(item.subjectName || item.subjectId || 'Subject');
            const exam = String(item.examName || item.examId || 'Exam');
            const marks = item.marksObtained ?? item.totalMarks ?? item.marks ?? '—';
            return (
              <View key={`${subject}-${exam}-${i}`} style={styles.listRow}>
                <Text style={styles.listTitle}>{subject}</Text>
                <Text style={styles.listMeta}>
                  {exam} · Marks: {String(marks)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {tab === 'timetable' ? (
        <View style={styles.panel}>
          {ttByDay.length === 0 ? (
            <Text style={styles.muted}>Timetable not available.</Text>
          ) : null}
          {ttByDay.map(([day, slots]) => (
            <View key={day} style={{ marginBottom: 12 }}>
              <Text style={styles.subSection}>{day}</Text>
              {slots.map((slot, i) => (
                <View key={`${day}-${i}`} style={styles.listRow}>
                  <Text style={styles.listTitle}>
                    {slot.startTime || '—'} – {slot.endTime || '—'}
                  </Text>
                  <Text style={styles.listMeta}>
                    {slot.subjectName || 'Subject'}
                    {slot.teacherName ? ` · ${slot.teacherName}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
    </ScreenShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg, padding: 24 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '600', color: primary },
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700' },
  heroName: { fontSize: 20, fontWeight: '700', color: Neutrals.text },
  heroMeta: { fontSize: 13, color: Neutrals.muted, marginTop: 2 },
  err: { color: '#B91C1C', marginBottom: 12 },
  muted: { color: Neutrals.muted },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Neutrals.card,
  },
  tabActive: { backgroundColor: `${primary}18` },
  tabText: { fontSize: 13, fontWeight: '600', color: Neutrals.muted },
  tabTextActive: { color: primary },
  panel: {
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Neutrals.border,
    gap: 12,
  },
  label: { fontSize: 14, color: Neutrals.muted },
  value: { fontSize: 14, fontWeight: '600', color: Neutrals.text, flexShrink: 1, textAlign: 'right' },
  subSection: {
    fontSize: 12,
    fontWeight: '700',
    color: Neutrals.muted,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  listRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Neutrals.border,
  },
  listTitle: { fontSize: 14, fontWeight: '600', color: Neutrals.text },
  listMeta: { fontSize: 12, color: Neutrals.muted, marginTop: 4 },
  payBtn: {
    marginTop: 16,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backBtn: { marginTop: 12, padding: 12 },
  backBtnText: { color: primary, fontWeight: '600' },
});
