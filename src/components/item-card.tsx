import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { daysLabel, formatShort, relativeLabel } from '@/lib/dates';
import { getNextActionDate, getStatus, overdueDays } from '@/lib/schedule';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';
import type { Item } from '@/lib/types';

import { Badge, CheckButton, ProgressBar } from './ui';

/**
 * Block card. With `action` it shows a check button that marks the block
 * learned (planned blocks) or the current review done (active blocks).
 */
export function ItemCard({ item, action }: { item: Item; action?: boolean }) {
  const c = useColors();
  const { today, settings, markLearned, markReviewed } = useStore();
  const status = getStatus(item);
  const next = getNextActionDate(item, settings.mode, today);
  const overdue = next ? overdueDays(next, today) : 0;
  const total = item.intervals.length;
  const done = Math.min(item.reviews.length, total);

  let subtitle: string;
  if (status === 'planned') {
    subtitle = action ? 'Выучить' : `Выучить: ${formatShort(item.plannedDate)} · ${relativeLabel(item.plannedDate, today)}`;
  } else if (status === 'active') {
    const label = `Повторение ${done + 1} из ${total}`;
    subtitle = action || !next ? label : `${label} · ${formatShort(next)} · ${relativeLabel(next, today)}`;
  } else {
    subtitle = `Все ${total} повторений пройдены`;
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: overdue > 0 && action ? c.warning : c.border,
        backgroundColor: c.card,
        opacity: pressed ? 0.85 : 1,
      })}>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }} numberOfLines={2}>
          {item.title || 'Без названия'}
        </Text>
        <Text style={{ fontSize: 14, color: c.muted }}>{subtitle}</Text>
        {item.note ? (
          <Text style={{ fontSize: 14, color: c.text }} numberOfLines={2}>
            {item.note}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {overdue > 0 && <Badge tone="warning" text={`просрочено на ${daysLabel(overdue)}`} />}
          {status === 'finished' && <Badge tone="success" text="выучено навсегда" />}
          {status === 'planned' && !action && <Badge tone="muted" text="запланировано" />}
        </View>
        {status !== 'planned' && total > 0 && <ProgressBar value={done} total={total} />}
      </View>
      {action && status === 'planned' && (
        <CheckButton label="Выучил" onPress={() => markLearned(item.id)} />
      )}
      {action && status === 'active' && (
        <CheckButton label="Повторил" onPress={() => markReviewed(item.id)} />
      )}
    </Pressable>
  );
}
