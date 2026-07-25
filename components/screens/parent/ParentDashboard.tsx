import { RoleColors } from '@/constants/school-theme';
import { useDashboardStyles } from '@/hooks/use-dashboard-styles';
import {
  attendancePercent,
  childClassLabel,
  childDisplayName,
  fetchChildAttendance,
  fetchParentMe,
  getSelectedChildId,
  resolveSelectedChild,
  setSelectedChildId,
  type ParentChild,
  type ParentChildAttendance,
  type ParentProfile,
} from '@/lib/parent-portal-api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.parent.primary;

export function ParentDashboard() {
  const router = useRouter();
  const styles = useDashboardStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selected, setSelected] = useState<ParentChild | null>(null);
  const [attendance, setAttendance] = useState<ParentChildAttendance | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const me = await fetchParentMe();
      const kids = me.children || [];
      setParent(me.parent);
      setChildren(kids);
      setInfoMessage(me.message || null);

      const preferredId = await getSelectedChildId();
      const child = resolveSelectedChild(kids, preferredId);
      setSelected(child);

      if (child?.studentId) {
        if (preferredId !== child.studentId) {
          await setSelectedChildId(child.studentId);
        }
        const att = await fetchChildAttendance(child.studentId, {
          session: child.session,
          days: 30,
        }).catch(() => null);
        setAttendance(att);
      } else {
        setAttendance(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load parent portal.');
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.muted}>Loading your dashboard…</Text>
      </View>
    );
  }

  const parentName =
    parent?.parentName?.trim() ||
    parent?.username ||
    'Parent';
  const childName = childDisplayName(selected);
  const rate = attendancePercent(attendance?.summary);
  const present = attendance?.summary?.present ?? 0;
  const absent = attendance?.summary?.absent ?? 0;
  const totalMarked =
    (attendance?.summary?.total || 0) - (attendance?.summary?.not_marked || 0);

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
      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.errText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.banner, { backgroundColor: primary }]}>
        <Text style={styles.bannerTitle}>Hello, {parentName}</Text>
        <Text style={styles.bannerSub}>
          {selected
            ? `Stay updated on ${childName}'s school life`
            : 'No linked children yet'}
        </Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#fff" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {!children.length ? (
        <View style={styles.emptyBox}>
          <Ionicons name="people-outline" size={28} color={styles.muted.color as string} />
          <Text style={styles.emptyTitle}>No children linked</Text>
          <Text style={styles.emptyText}>
            {infoMessage ||
              'Ask your school admin to link your account to a student.'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.stats}>
            {[
              {
                icon: 'school-outline' as const,
                n: rate != null ? `${rate}%` : '—',
                l: 'Attendance',
              },
              {
                icon: 'people-outline' as const,
                n: String(children.length),
                l: children.length === 1 ? 'Child' : 'Children',
              },
              {
                icon: 'checkmark-circle-outline' as const,
                n: String(present),
                l: 'Present (30d)',
              },
              {
                icon: 'close-circle-outline' as const,
                n: String(absent),
                l: 'Absent (30d)',
              },
            ].map((s) => (
              <View key={s.l} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${primary}22` }]}>
                  <Ionicons name={s.icon} size={22} color={primary} />
                </View>
                <View>
                  <Text style={styles.statN}>{s.n}</Text>
                  <Text style={styles.statL}>{s.l}</Text>
                </View>
              </View>
            ))}
          </View>

          {selected ? (
            <Pressable
              style={styles.childCard}
              onPress={() => router.push('/(parent)/(tabs)/children' as never)}
            >
              <View style={[styles.avatar, { backgroundColor: `${primary}22` }]}>
                <Text style={[styles.avText, { color: primary }]}>
                  {childName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{childName}</Text>
                <Text style={styles.childMeta}>{childClassLabel(selected)}</Text>
                <Text style={styles.childMeta}>
                  {totalMarked > 0
                    ? `${totalMarked} attendance day${totalMarked === 1 ? '' : 's'} in last 30`
                    : 'No attendance marked in last 30 days'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>
          ) : null}

          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actions}>
            {(
              [
                { label: 'Children', href: '/(parent)/(tabs)/children' },
                { label: 'Profile', href: '/(parent)/(tabs)/profile' },
                { label: 'Settings', href: '/(parent)/(tabs)/settings' },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.label}
                style={styles.actionPill}
                onPress={() => router.push(item.href as never)}
              >
                <Text style={styles.actionPillText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
