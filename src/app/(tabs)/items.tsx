import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ItemCard } from '@/components/item-card';
import { Chip, Empty, Fab, Input, Screen, SectionTitle, styles } from '@/components/ui';
import { getNextActionDate, getStatus, type ItemStatus } from '@/lib/schedule';
import { useStore } from '@/lib/store';

const GROUPS: { status: ItemStatus; title: string }[] = [
  { status: 'active', title: 'На повторении' },
  { status: 'planned', title: 'Запланировано' },
  { status: 'finished', title: 'Выучено' },
];

export default function ItemsScreen() {
  const { items, settings, today } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ItemStatus | 'all'>('all');

  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (it) => !q || it.title.toLowerCase().includes(q) || it.note.toLowerCase().includes(q),
  );

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        {items.length > 0 && (
          <>
            <Input value={query} onChangeText={setQuery} placeholder="Поиск по названию и словам" />
            <View style={styles.chipRow}>
              <Chip label={`Все · ${items.length}`} active={filter === 'all'} onPress={() => setFilter('all')} />
              {GROUPS.map((g) => (
                <Chip
                  key={g.status}
                  label={`${g.title} · ${items.filter((it) => getStatus(it) === g.status).length}`}
                  active={filter === g.status}
                  onPress={() => setFilter(g.status)}
                />
              ))}
            </View>
          </>
        )}

        {GROUPS.filter((g) => filter === 'all' || filter === g.status).map((g) => {
          const list = visible
            .filter((it) => getStatus(it) === g.status)
            .sort((a, b) =>
              g.status === 'finished'
                ? b.createdAt - a.createdAt
                : (getNextActionDate(a, settings.mode, today) ?? '').localeCompare(
                    getNextActionDate(b, settings.mode, today) ?? '',
                  ),
            );
          if (!list.length) return null;
          return (
            <View key={g.status} style={{ gap: 10 }}>
              <SectionTitle>
                {g.title} · {list.length}
              </SectionTitle>
              {list.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </View>
          );
        })}

        {items.length === 0 && (
          <Empty icon="albums-outline" title="Блоков пока нет" text="Нажмите «+», чтобы добавить первый." />
        )}
        {items.length > 0 && visible.length === 0 && <Empty icon="search-outline" title="Ничего не найдено" />}
      </Screen>
      <Fab onPress={() => router.push('/add')} />
    </View>
  );
}
