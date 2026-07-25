import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles, useThemeColors } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { attendanceStatusLabel } from '@/lib/attendance-utils';
import {
  fetchStudentAttendance,
  fetchStudentProfile,
  type AttendanceStatusKey,
  type StudentAttendanceRecord,
  type StudentAttendanceResponse,
} from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;
const compactCellSize = Math.floor((Dimensions.get('window').width - 40 - 24) / 7);

const useAttendanceStyles = createThemedStyles((colors, isDark) => ({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF',
    borderColor: isDark ? '#1D4ED8' : '#BFDBFE',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  infoText: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  segment: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.input : '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
  },
  segmentButtonActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  segmentTextActive: { color: primary },
  overviewCard: {
    backgroundColor: primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overviewLabel: { color: '#DBEAFE', fontSize: 13, fontWeight: '700' },
  overviewValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', marginTop: 4 },
  overviewMeta: { color: '#E0F2FE', fontSize: 12, marginTop: 2 },
  progressRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  progressSub: { color: '#E0F2FE', fontSize: 10, fontWeight: '700' },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCard: {
    width: '23%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 24, fontWeight: '800' },
  summaryLabel: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  selectedCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  selectedTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  selectedBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },
  selectedBadgeText: { fontSize: 12, fontWeight: '800' },
  selectedMeta: { color: colors.muted, fontSize: 13, marginTop: 6 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: { fontSize: 12, fontWeight: '800' },
  legendLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  focusCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  focusLabel: { fontSize: 13, color: colors.muted, fontWeight: '700' },
  focusDate: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 },
  focusStatus: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  focusSymbol: { fontSize: 42, fontWeight: '900' },
  focusStatusText: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  weekRow: { flexDirection: 'row', gap: 7 },
  monthCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekHeaderText: {
    width: compactCellSize,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: colors.muted,
  },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: {
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekdayText: { fontSize: 9, fontWeight: '800', marginBottom: 2 },
  dayNumber: { fontSize: 10, fontWeight: '700' },
  daySymbol: { fontSize: 15, fontWeight: '900', marginTop: 1 },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  monthSummary: {
    width: '30.8%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  monthSummaryTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
  monthSummaryPercent: { fontSize: 22, fontWeight: '900', color: primary, marginTop: 8 },
  monthSummaryMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  pickerNav: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDark ? colors.input : '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  pickerDay: {
    width: compactCellSize,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDaySelected: { backgroundColor: primary },
  pickerDayDisabled: { opacity: 0.35 },
  pickerDayText: { fontSize: 13, fontWeight: '700', color: colors.text },
  pickerDayTextSelected: { color: '#FFFFFF' },
  pickerDayTextDisabled: { color: colors.muted },
  closeButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: isDark ? colors.input : '#F1F5F9',
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: { color: colors.text, fontSize: 14, fontWeight: '800' },
}));

function useStyles() {
  return { ...usePortalScreenStyles(), ...useAttendanceStyles() };
}

type AttendanceSymbol = 'P' | 'A' | 'L' | 'e' | '—';
type ViewMode = 'day' | 'week' | 'month' | 'year';

type DayItem = {
  date: string;
  day: number;
  weekday: string;
  month: string;
  record?: StudentAttendanceRecord;
};

type MonthSummary = {
  key: string;
  label: string;
  days: DayItem[];
  counts: Record<AttendanceSymbol, number>;
};

const STATUS_CONFIG: Record<
  AttendanceSymbol,
  { label: string; bg: string; fg: string; border: string }
> = {
  P: { label: 'Present', bg: '#DCFCE7', fg: '#166534', border: '#86EFAC' },
  A: { label: 'Absent', bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' },
  L: { label: 'Late', bg: '#FEF3C7', fg: '#92400E', border: '#FCD34D' },
  e: { label: 'Excuse', bg: '#DBEAFE', fg: '#1D4ED8', border: '#93C5FD' },
  '—': { label: 'Not marked', bg: '#F1F5F9', fg: '#94A3B8', border: '#E2E8F0' },
};

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildDays(response: StudentAttendanceResponse | null): DayItem[] {
  const days = response?.days || 360;
  const end = response?.toDate ? parseYmd(response.toDate) : new Date();
  const start = response?.fromDate ? parseYmd(response.fromDate) : new Date(end);
  if (!response?.fromDate) start.setDate(end.getDate() - days + 1);

  const records = new Map((response?.records || []).map((record) => [record.date, record]));
  const items: DayItem[] = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const key = toYmd(date);
    items.push({
      date: key,
      day: date.getDate(),
      weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
      month: date.toLocaleDateString(undefined, { month: 'short' }),
      record: records.get(key),
    });
  }

  return items.slice(-days);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function sameYear(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear();
}

function statusSymbol(status?: AttendanceStatusKey): AttendanceSymbol {
  if (status === 'present' || status === 'half_day' || status === 'quarter_day') return 'P';
  if (status === 'absent') return 'A';
  if (status === 'late') return 'L';
  if (status === 'leave') return 'e';
  return '—';
}

function formatDate(date: string) {
  return parseYmd(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPeriod(mode: ViewMode, date: string) {
  const selected = parseYmd(date);
  if (mode === 'day') return formatDate(date);
  if (mode === 'week') {
    const start = startOfWeek(selected);
    const end = addDays(start, 6);
    return `${formatDate(toYmd(start))} - ${formatDate(toYmd(end))}`;
  }
  if (mode === 'month') {
    return selected.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  return selected.toLocaleDateString(undefined, { year: 'numeric' });
}

function countDays(items: DayItem[]) {
  return items.reduce(
    (acc, item) => {
      acc[statusSymbol(item.record?.statusKey)] += 1;
      return acc;
    },
    { P: 0, A: 0, L: 0, e: 0, '—': 0 } as Record<AttendanceSymbol, number>,
  );
}

function attendancePercent(counts: Record<AttendanceSymbol, number>) {
  const marked = counts.P + counts.A + counts.L + counts.e;
  if (!marked) return 0;
  return Math.round(((counts.P + counts.L) / marked) * 100);
}

function filterPeriodDays(days: DayItem[], selectedDate: string | null, mode: ViewMode) {
  if (!selectedDate) return days;
  const selected = parseYmd(selectedDate);

  if (mode === 'day') {
    return days.filter((item) => item.date === selectedDate);
  }

  if (mode === 'week') {
    const start = startOfWeek(selected);
    const end = addDays(start, 6);
    return days.filter((item) => {
      const current = parseYmd(item.date);
      return current >= start && current <= end;
    });
  }

  if (mode === 'month') {
    return days.filter((item) => sameMonth(parseYmd(item.date), selected));
  }

  return days.filter((item) => sameYear(parseYmd(item.date), selected));
}

function buildMonthCalendar(days: DayItem[], selectedDate: string | null) {
  const selected = selectedDate ? parseYmd(selectedDate) : new Date();
  const first = startOfMonth(selected);
  const last = endOfMonth(selected);
  const byDate = new Map(days.map((item) => [item.date, item]));
  const cells: (DayItem | null)[] = Array.from({ length: first.getDay() }, () => null);

  for (let date = new Date(first); date <= last; date = addDays(date, 1)) {
    const key = toYmd(date);
    cells.push(
      byDate.get(key) || {
        date: key,
        day: date.getDate(),
        weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
        month: date.toLocaleDateString(undefined, { month: 'short' }),
      },
    );
  }

  return cells;
}

function buildYearSummary(days: DayItem[], selectedDate: string | null): MonthSummary[] {
  const selected = selectedDate ? parseYmd(selectedDate) : new Date();
  return Array.from({ length: 12 }, (_, month) => {
    const monthDays = days.filter((item) => {
      const current = parseYmd(item.date);
      return current.getFullYear() === selected.getFullYear() && current.getMonth() === month;
    });
    const date = new Date(selected.getFullYear(), month, 1);
    return {
      key: `${selected.getFullYear()}-${month}`,
      label: date.toLocaleDateString(undefined, { month: 'short' }),
      days: monthDays,
      counts: countDays(monthDays),
    };
  });
}

function buildPickerMonth(days: DayItem[], visibleMonth: Date) {
  const first = startOfMonth(visibleMonth);
  const last = endOfMonth(visibleMonth);
  const available = new Set(days.map((item) => item.date));
  const cells: ({ date: string; day: number; enabled: boolean } | null)[] = Array.from(
    { length: first.getDay() },
    () => null,
  );

  for (let date = new Date(first); date <= last; date = addDays(date, 1)) {
    const key = toYmd(date);
    cells.push({ date: key, day: date.getDate(), enabled: available.has(key) });
  }

  return cells;
}

export default function StudentAttendanceScreen() {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendanceResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await fetchStudentProfile();
      const data = await fetchStudentAttendance(profile.academicInformation?.session, 360);
      setAttendance(data);
      setSelectedDate(data.toDate);
      setPickerMonth(parseYmd(data.toDate));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load attendance.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => buildDays(attendance), [attendance]);
  const selected = days.find((item) => item.date === selectedDate) || days[days.length - 1];
  const selectedSymbol = statusSymbol(selected?.record?.statusKey);
  const selectedConfig = STATUS_CONFIG[selectedSymbol];
  const periodDays = useMemo(
    () => filterPeriodDays(days, selected?.date || selectedDate, viewMode),
    [days, selected?.date, selectedDate, viewMode],
  );
  const monthCells = useMemo(
    () => buildMonthCalendar(days, selected?.date || selectedDate),
    [days, selected?.date, selectedDate],
  );
  const yearSummary = useMemo(
    () => buildYearSummary(days, selected?.date || selectedDate),
    [days, selected?.date, selectedDate],
  );
  const pickerCells = useMemo(() => buildPickerMonth(days, pickerMonth), [days, pickerMonth]);
  const counts = useMemo(() => countDays(periodDays), [periodDays]);
  const percentage = attendancePercent(counts);
  const periodLabel = selected ? formatPeriod(viewMode, selected.date) : 'Attendance';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.sub}>{periodLabel}</Text>
        </View>
        <Pressable
          onPress={() => {
            setPickerMonth(selected?.date ? parseYmd(selected.date) : new Date());
            setPickerOpen(true);
          }}
          style={[styles.headerIcon, { backgroundColor: `${primary}18` }]}
        >
          <Ionicons name="calendar-outline" size={24} color={primary} />
        </Pressable>
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Present, absent, and late are marked manually by your teacher or school admin. Check-in
          and check-out times appear here only when recorded by school devices.
        </Text>
      </View>

      <View style={styles.segment}>
        {VIEW_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => setViewMode(option.key)}
            style={[styles.segmentButton, viewMode === option.key && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, viewMode === option.key && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.overviewCard}>
        <View>
          <Text style={styles.overviewLabel}>Attendance Rate</Text>
          <Text style={styles.overviewValue}>{percentage}%</Text>
          <Text style={styles.overviewMeta}>
            {counts.P + counts.L} attended out of {counts.P + counts.A + counts.L + counts.e} marked days
          </Text>
        </View>
        <View style={styles.progressRing}>
          <Text style={styles.progressText}>{periodDays.length}</Text>
          <Text style={styles.progressSub}>days</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        {(['P', 'A', 'L', 'e'] as AttendanceSymbol[]).map((symbol) => {
          const config = STATUS_CONFIG[symbol];
          return (
            <View key={symbol} style={[styles.summaryCard, { backgroundColor: config.bg }]}>
              <Text style={[styles.summaryValue, { color: config.fg }]}>{counts[symbol]}</Text>
              <Text style={[styles.summaryLabel, { color: config.fg }]}>{config.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.selectedCard}>
        <Text style={styles.selectedTitle}>
          {selected ? formatDate(selected.date) : 'No day selected'}
        </Text>
        <View style={[styles.selectedBadge, { backgroundColor: selectedConfig.bg }]}>
          <Text style={[styles.selectedBadgeText, { color: selectedConfig.fg }]}>
            {selected?.record?.statusKey
              ? attendanceStatusLabel(selected.record.statusKey)
              : selectedConfig.label}
          </Text>
        </View>
        {selected?.record?.checkInTime || selected?.record?.checkOutTime ? (
          <Text style={styles.selectedMeta}>
            Check-in/out: {selected.record.checkInTime || '--'} to {selected.record.checkOutTime || '--'}
          </Text>
        ) : selected?.record?.statusKey && selected.record.statusKey !== 'not_marked' ? (
          <Text style={styles.selectedMeta}>Manual attendance mark (no device punch recorded)</Text>
        ) : null}
        {selected?.record?.remarks ? <Text style={styles.selectedMeta}>{selected.record.remarks}</Text> : null}
      </View>

      {/* <Legend /> */}

      {viewMode === 'day' ? (
        <DayView selected={selected} />
      ) : null}

      {viewMode === 'week' ? (
        <WeekView days={periodDays} selectedDate={selected?.date} onSelect={setSelectedDate} />
      ) : null}

      {viewMode === 'month' ? (
        <MonthView cells={monthCells} selectedDate={selected?.date} onSelect={setSelectedDate} />
      ) : null}

      {viewMode === 'year' ? (
        <YearView months={yearSummary} onSelectMonth={(month) => {
          setSelectedDate(month.days[month.days.length - 1]?.date || selected?.date || null);
          setViewMode('month');
        }} />
      ) : null}

      <DatePickerModal
        visible={pickerOpen}
        visibleMonth={pickerMonth}
        cells={pickerCells}
        selectedDate={selected?.date}
        onClose={() => setPickerOpen(false)}
        onPrevMonth={() => setPickerMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
        onNextMonth={() => setPickerMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
        onSelect={(date) => {
          setSelectedDate(date);
          setPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}

function Legend() {
  const styles = useStyles();
  return (
    <View style={styles.legend}>
      {(['P', 'A', 'L', 'e', '—'] as AttendanceSymbol[]).map((symbol) => {
        const config = STATUS_CONFIG[symbol];
        return (
          <View key={symbol} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: config.bg, borderColor: config.border }]}>
              <Text style={[styles.legendText, { color: config.fg }]}>{symbol}</Text>
            </View>
            <Text style={styles.legendLabel}>{config.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function DayView({ selected }: { selected?: DayItem }) {
  const styles = useStyles();
  if (!selected) return null;
  const symbol = statusSymbol(selected.record?.statusKey);
  const config = STATUS_CONFIG[symbol];
  return (
    <View style={styles.focusCard}>
      <Text style={styles.focusLabel}>{selected.weekday}</Text>
      <Text style={styles.focusDate}>{formatDate(selected.date)}</Text>
      <View style={[styles.focusStatus, { backgroundColor: config.bg, borderColor: config.border }]}>
        <Text style={[styles.focusSymbol, { color: config.fg }]}>{symbol}</Text>
        <Text style={[styles.focusStatusText, { color: config.fg }]}>{config.label}</Text>
      </View>
    </View>
  );
}

function WeekView({
  days,
  selectedDate,
  onSelect,
}: {
  days: DayItem[];
  selectedDate?: string;
  onSelect: (date: string) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.weekRow}>
      {days.map((item) => (
        <AttendanceCell
          key={item.date}
          item={item}
          selected={item.date === selectedDate}
          size={(Dimensions.get('window').width - 40 - 42) / 7}
          onPress={() => onSelect(item.date)}
          showWeekday
        />
      ))}
    </View>
  );
}

function MonthView({
  cells,
  selectedDate,
  onSelect,
}: {
  cells: (DayItem | null)[];
  selectedDate?: string;
  onSelect: (date: string) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.monthCard}>
      <View style={styles.weekHeader}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekHeaderText}>{day}</Text>
        ))}
      </View>
      <View style={styles.calendar}>
        {cells.map((item, index) =>
          item ? (
            <AttendanceCell
              key={item.date}
              item={item}
              selected={item.date === selectedDate}
              size={compactCellSize}
              onPress={() => onSelect(item.date)}
            />
          ) : (
            <View key={`empty-${index}`} style={{ width: compactCellSize, height: compactCellSize + 8 }} />
          ),
        )}
      </View>
    </View>
  );
}

function YearView({
  months,
  onSelectMonth,
}: {
  months: MonthSummary[];
  onSelectMonth: (month: MonthSummary) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.yearGrid}>
      {months.map((month) => {
        const pct = attendancePercent(month.counts);
        return (
          <Pressable key={month.key} onPress={() => onSelectMonth(month)} style={styles.monthSummary}>
            <Text style={styles.monthSummaryTitle}>{month.label}</Text>
            <Text style={styles.monthSummaryPercent}>{pct}%</Text>
            <Text style={styles.monthSummaryMeta}>
              P {month.counts.P + month.counts.L} · A {month.counts.A}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AttendanceCell({
  item,
  selected,
  size,
  showWeekday,
  onPress,
}: {
  item: DayItem;
  selected: boolean;
  size: number;
  showWeekday?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const symbol = statusSymbol(item.record?.statusKey);
  const config = STATUS_CONFIG[symbol];
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dayCell,
        {
          width: size,
          height: size + (showWeekday ? 24 : 8),
          backgroundColor: config.bg,
          borderColor: selected ? primary : config.border,
        },
      ]}
    >
      {showWeekday ? <Text style={[styles.weekdayText, { color: config.fg }]}>{item.weekday}</Text> : null}
      <Text style={[styles.dayNumber, { color: config.fg }]}>{item.day}</Text>
      <Text style={[styles.daySymbol, { color: config.fg }]}>{symbol}</Text>
    </Pressable>
  );
}

function DatePickerModal({
  visible,
  visibleMonth,
  cells,
  selectedDate,
  onClose,
  onPrevMonth,
  onNextMonth,
  onSelect,
}: {
  visible: boolean;
  visibleMonth: Date;
  cells: ({ date: string; day: number; enabled: boolean } | null)[];
  selectedDate?: string;
  onClose: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelect: (date: string) => void;
}) {
  const styles = useStyles();
  const { colors } = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.pickerCard} onPress={() => undefined}>
          <View style={styles.pickerHeader}>
            <Pressable onPress={onPrevMonth} style={styles.pickerNav}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.pickerTitle}>
              {visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable onPress={onNextMonth} style={styles.pickerNav}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.weekHeader}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekHeaderText}>{day}</Text>
            ))}
          </View>
          <View style={styles.pickerGrid}>
            {cells.map((cell, index) =>
              cell ? (
                <Pressable
                  key={cell.date}
                  disabled={!cell.enabled}
                  onPress={() => onSelect(cell.date)}
                  style={[
                    styles.pickerDay,
                    cell.date === selectedDate && styles.pickerDaySelected,
                    !cell.enabled && styles.pickerDayDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerDayText,
                      cell.date === selectedDate && styles.pickerDayTextSelected,
                      !cell.enabled && styles.pickerDayTextDisabled,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              ) : (
                <View key={`picker-empty-${index}`} style={styles.pickerDay} />
              ),
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

