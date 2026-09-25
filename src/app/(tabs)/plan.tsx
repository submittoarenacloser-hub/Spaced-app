import { router } from 'expo-router';
import { Pressable, SectionList, Text, View } from 'react-native';

import { Empty, Fab, Hint, styles } from '@/components/ui';
import { formatShort, relativeLabel } from '@/lib/dates';
import { buildPlan, type PlanEntry } from '@/lib/schedule';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';

interface Section {
  key: string;
  title: string;
  subtitle: string;
  overdue: boolean;
  data: PlanEntry[];
}

export default function PlanScreen() {
  const c = useColors();
  const { items, settings, today } = useStore();

  const sections: Section[] = [];
  for (const entry of buildPlan(items, settings.mode, today)) {
    const overdue = entry.date < today;
    const key = overdue ? 'overdue' : entry.date;
    let section = sections[sections.length - 1];
    if (!section || section.key !== key) {
      section = overdue
        ? { key, title: 'Просрочено', subtitle: 'сделайте сегодня', overdue, data: [] }
        : {
            key,
            title: formatShort(entry.date),
            subtitle: relativeLabel(entry.date, today),
            overdue,
            data: [],
          };
      sections.push(section);
    }
    section.data.push(entry);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.key}
        contentContainerStyle={[styles.screen, { gap: 8 }]}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          sections.length ? (
            <Hint>Все будущие изучения и повторения по дням. Нажмите на блок, чтобы открыть его.</Hint>
          ) : null
        }
        ListEmptyComponent={
          <Empty
            icon="calendar-outline"
            title="План пуст"
            text="Добавьте блок слов — здесь появится расписание повторений."
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: section.overdue ? c.warning : section.key === today ? c.primary : c.text,
              }}>
              {section.title}
            </Text>
            <Text style={{ color: c.muted, fontSize: 14 }}>{section.subtitle}</Text>
            <Text style={{ color: c.muted, fontSize: 14, marginLeft: 'auto' }}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item: entry }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: entry.item.id } })}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              opacity: pressed ? 0.8 : 1,
            })}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: entry.kind === 'learn' ? c.primary : c.success,
              }}
            />
            <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: c.text }} numberOfLines={1}>
              {entry.item.title || 'Без названия'}
            </Text>
            <Text style={{ color: c.muted, fontSize: 13 }}>
              {entry.kind === 'learn' ? 'выучить' : `повтор ${entry.number}/${entry.total}`}
            </Text>
          </Pressable>
        )}
      />
      <Fab onPress={() => router.push('/add')} />
    </View>
  );
}
