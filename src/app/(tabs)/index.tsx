import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ItemCard } from '@/components/item-card';
import { Empty, Fab, Hint, Screen, SectionTitle } from '@/components/ui';
import { formatLong, formatShort, plural, relativeLabel } from '@/lib/dates';
import { buildPlan, getNextActionDate, getStatus } from '@/lib/schedule';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';
import type { Item } from '@/lib/types';

export default function TodayScreen() {
  const c = useColors();
  const { items, settings, today } = useStore();

  const due = (date: string | null) => date !== null && date <= today;
  const byDate = (a: Item, b: Item) =>
    (getNextActionDate(a, settings.mode, today) ?? '').localeCompare(
      getNextActionDate(b, settings.mode, today) ?? '',
    ) || a.createdAt - b.createdAt;

  const toLearn = items
    .filter((it) => getStatus(it) === 'planned' && due(it.plannedDate))
    .sort(byDate);
  const toReview = items
    .filter((it) => getStatus(it) === 'active' && due(getNextActionDate(it, settings.mode, today)))
    .sort(byDate);

  // Nearest future day with something to do, shown when today is empty.
  const upcoming = buildPlan(items, settings.mode, today).filter((e) => e.date > today);
  const nextDay = upcoming[0]?.date;
  const nextDayCount = upcoming.filter((e) => e.date === nextDay).length;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <View style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: c.text }}>{formatLong(today)}</Text>
          <Hint>
            {toLearn.length + toReview.length > 0
              ? `На сегодня: выучить — ${toLearn.length}, повторить — ${toReview.length}. Нажмите ✓, когда сделаете.`
              : 'Нажмите «+», чтобы добавить, что нужно выучить.'}
          </Hint>
        </View>

        {toReview.length > 0 && (
          <>
            <SectionTitle>Повторить сегодня · {toReview.length}</SectionTitle>
            {toReview.map((it) => (
              <ItemCard key={it.id} item={it} action />
            ))}
          </>
        )}

        {toLearn.length > 0 && (
          <>
            <SectionTitle>Выучить сегодня · {toLearn.length}</SectionTitle>
            {toLearn.map((it) => (
              <ItemCard key={it.id} item={it} action />
            ))}
          </>
        )}

        {toLearn.length + toReview.length === 0 && (
          <Empty
            icon={items.length ? 'checkmark-done-circle-outline' : 'book-outline'}
            title={items.length ? 'На сегодня всё сделано!' : 'Пока ничего нет'}
            text={
              nextDay
                ? `Дальше: ${formatShort(nextDay)} (${relativeLabel(nextDay, today)}) — ${nextDayCount} ${plural(nextDayCount, ['задание', 'задания', 'заданий'])}.`
                : items.length
                  ? 'Добавьте новый блок слов, чтобы продолжить.'
                  : 'Добавьте первый блок, например «Слова 1–10». Когда выучите его — отметьте галочкой, и приложение само распланирует повторения.'
            }
          />
        )}
      </Screen>
      <Fab onPress={() => router.push('/add')} />
    </View>
  );
}
