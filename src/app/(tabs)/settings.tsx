import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';

import { ReminderSettings } from '@/components/reminder-settings';
import { Button, Card, Hint, Input, IntervalsEditor, Label, Row, Screen, SectionTitle } from '@/components/ui';
import { addDays, formatShort } from '@/lib/dates';
import { getStatus } from '@/lib/schedule';
import { parseData } from '@/lib/storage';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';
import { DEFAULT_INTERVALS, type ScheduleMode } from '@/lib/types';

const MODES: { mode: ScheduleMode; title: string; text: string }[] = [
  {
    mode: 'fromLearned',
    title: 'От даты изучения',
    text: 'Интервалы 1, 3, 7 → повторения через 1, 3 и 7 дней после того, как выучил.',
  },
  {
    mode: 'fromPrevious',
    title: 'От предыдущего повторения',
    text: 'Интервалы 1, 3, 7 → через 1 день, затем через 3 дня после него, затем через 7.',
  },
];

export default function SettingsScreen() {
  const c = useColors();
  const store = useStore();
  const { settings, items, today } = store;
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  // Example of what the current settings mean for a block learned today.
  const example: string[] = [];
  let base = today;
  for (const d of settings.intervals.slice(0, 6)) {
    base = addDays(settings.mode === 'fromLearned' ? today : base, d);
    example.push(formatShort(base));
  }

  const unfinished = items.filter((it) => getStatus(it) !== 'finished').length;

  const applyToAll = () =>
    Alert.alert(
      'Применить ко всем блокам?',
      `Интервалы будут заменены у ${unfinished} незавершённых блоков (включая блоки со своими интервалами). Уже сделанные повторения сохранятся.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Применить', onPress: store.applyIntervalsToAll },
      ],
    );

  const exportData = () => {
    Share.share({ message: JSON.stringify(store.exportData()) }).catch(() => {});
  };

  const importData = () => {
    try {
      const data = parseData(importText.trim());
      Alert.alert(
        'Заменить все данные?',
        `Будет загружено блоков: ${data.items.length}. Текущие данные будут удалены.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Заменить',
            style: 'destructive',
            onPress: () => {
              store.replaceData(data);
              setImportText('');
              setShowImport(false);
            },
          },
        ],
      );
    } catch {
      Alert.alert('Не получилось', 'Текст не похож на резервную копию этого приложения.');
    }
  };

  return (
    <Screen>
      <Button
        title="Как это работает — инструкция"
        icon="help-circle-outline"
        variant="secondary"
        onPress={() => router.push('/guide')}
      />

      <SectionTitle>Напоминания</SectionTitle>
      <ReminderSettings />

      <SectionTitle>Интервалы повторений</SectionTitle>
      <Card>
        <Hint>
          Через сколько дней повторять выученный блок. Добавляйте и удаляйте интервалы как вам удобно —
          они применяются к новым блокам.
        </Hint>
        <IntervalsEditor
          value={settings.intervals}
          onChange={(intervals) => store.updateSettings({ intervals })}
          onReset={() => store.updateSettings({ intervals: DEFAULT_INTERVALS })}
        />
        {example.length > 0 && (
          <Hint>
            Если выучить сегодня, повторения будут: {example.join(', ')}
            {settings.intervals.length > example.length ? ' …' : ''}
          </Hint>
        )}
        {unfinished > 0 && (
          <Button
            title="Применить ко всем текущим блокам"
            icon="sync-outline"
            variant="secondary"
            small
            onPress={applyToAll}
          />
        )}
      </Card>

      <SectionTitle>Как считать даты</SectionTitle>
      <Card style={{ gap: 4 }}>
        {MODES.map((m) => {
          const active = settings.mode === m.mode;
          return (
            <Pressable key={m.mode} onPress={() => store.updateSettings({ mode: m.mode })}>
              <Row style={{ alignItems: 'flex-start', paddingVertical: 8 }}>
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={active ? c.primary : c.muted}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{m.title}</Text>
                  <Hint>{m.text}</Hint>
                </View>
              </Row>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>Резервная копия</SectionTitle>
      <Card>
        <Hint>
          Все данные хранятся только на этом телефоне. Чтобы перенести их на другой телефон, отправьте
          себе копию (например, в Telegram), а потом вставьте её текст на новом устройстве.
        </Hint>
        <Button title="Сохранить копию" icon="share-outline" variant="secondary" small onPress={exportData} />
        {showImport ? (
          <>
            <Label>Вставьте текст копии</Label>
            <Input value={importText} onChangeText={setImportText} multiline placeholder='{"items":[…]}' />
            <Row>
              <Button
                title="Загрузить"
                small
                onPress={importData}
                disabled={!importText.trim()}
                style={{ flex: 1 }}
              />
              <Button title="Отмена" small variant="ghost" onPress={() => setShowImport(false)} />
            </Row>
          </>
        ) : (
          <Button
            title="Загрузить из копии"
            icon="download-outline"
            variant="ghost"
            small
            onPress={() => setShowImport(true)}
          />
        )}
      </Card>

      <Hint>
        Блоков: {items.length} · на повторении: {items.filter((it) => getStatus(it) === 'active').length} ·
        выучено: {items.filter((it) => getStatus(it) === 'finished').length}
      </Hint>
    </Screen>
  );
}
