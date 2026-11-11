import { createThemedStyles } from '@/hooks/create-themed-styles';
import type { RefundOption } from '@/lib/payment-api';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

const useStyles = createThemedStyles((colors) => ({
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipOn: { borderColor: colors.text },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    minHeight: 72,
    color: colors.text,
    textAlignVertical: 'top',
  },
  error: { fontSize: 12, color: '#b91c1c' },
  ok: { fontSize: 12, color: '#047857' },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
}));

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function RefundRequestForm({
  options,
  accent,
  onSubmit,
}: {
  options: RefundOption[];
  accent: string;
  onSubmit: (body: { feesTypeId: string; reason: string }) => Promise<string | void>;
}) {
  const styles = useStyles();
  const requestable = options.filter((item) => item.canRequest);
  const [feesTypeId, setFeesTypeId] = useState(requestable[0]?.feesTypeId || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = requestable.find((item) => item.feesTypeId === feesTypeId) || requestable[0];

  async function submit() {
    if (!selected) return;
    if (reason.trim().length < 5) {
      setError('Tell the school why you are requesting this refund.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const message = await onSubmit({ feesTypeId: selected.feesTypeId, reason: reason.trim() });
      setReason('');
      setNotice(message || 'Request sent. The school will review it.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Request a refund</Text>
      <Text style={styles.hint}>
        For admission cancellation or leaving the school. The school approves it before any payout.
      </Text>
      {requestable.length === 0 ? (
        <Text style={styles.hint}>
          {options[0]?.message || 'No refundable fee is ready to request.'}
        </Text>
      ) : (
        <>
          {requestable.map((item) => (
            <Pressable
              key={item.feesTypeId}
              style={[styles.chip, (selected?.feesTypeId === item.feesTypeId) && styles.chipOn]}
              onPress={() => setFeesTypeId(item.feesTypeId)}
            >
              <Text style={styles.chipText}>{item.feesTypeName} · {money(item.available)}</Text>
              <Text style={styles.hint}>
                Paid {money(item.paidAmount)} · {item.refundPercent || 0}%
              </Text>
            </Pressable>
          ))}
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Example: Admission cancelled. Please refund the admission fee."
            placeholderTextColor="#94a3b8"
            multiline
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.ok}>{notice}</Text> : null}
          <Pressable style={[styles.btn, { backgroundColor: accent }, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => void submit()}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send refund request</Text>}
          </Pressable>
        </>
      )}
    </View>
  );
}
