const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const DAY_LABELS: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

export function formatTime12h(time?: string): string {
  if (!time) return '--';
  const [hRaw, mRaw] = time.split(':').map(Number);
  const hour24 = Number.isFinite(hRaw) ? hRaw : 0;
  const minutes = Number.isFinite(mRaw) ? mRaw : 0;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  let hours = hour24 % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function formatTimeRange12h(start?: string, end?: string): string {
  if (!start && !end) return 'Time not set';
  if (!end) return formatTime12h(start);
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

export function dayLabel(day?: string): string {
  if (!day) return 'Day';
  return DAY_LABELS[day] || day;
}

export function daySortIndex(day?: string): number {
  if (!day) return 99;
  const short = day.length > 3 ? day.slice(0, 3) : day;
  const idx = DAY_ORDER.indexOf(short as (typeof DAY_ORDER)[number]);
  return idx >= 0 ? idx : 99;
}

export function timeSortKey(time?: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export type TimetableLikeSlot = {
  day?: string;
  startTime?: string;
  endTime?: string;
};

export function groupSlotsByDay<T extends TimetableLikeSlot>(slots: T[]): { day: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  slots.forEach((slot) => {
    const key = slot.day || 'Other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  });

  return [...map.entries()]
    .sort(([a], [b]) => daySortIndex(a) - daySortIndex(b))
    .map(([day, items]) => ({
      day,
      label: dayLabel(day),
      items: [...items].sort(
        (a, b) => timeSortKey(a.startTime) - timeSortKey(b.startTime),
      ),
    }));
}
