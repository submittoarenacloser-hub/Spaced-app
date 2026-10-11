import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  DateStepper,
  Empty,
  Hint,
  Input,
  IntervalsEditor,
  Label,
  ProgressBar,
  Row,
  Screen,
  SectionTitle,
} from '@/components/ui';
import { formatShort, intervalLabel, relativeLabel } from '@/lib/dates';
import { getSchedule, getStatus } from '@/lib/schedule';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';

export default function ItemScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { today, settings } = store;
  const item = store.items.find((it) => it.id === id);

  if (!item) {
    return (
      <Screen>
        <Empty icon="alert-circle-outline" title="Блок не найден" text="Возможно, он был удалён." />
      </Screen>
    );
  }

  const status = getStatus(item);
  const schedule = getSchedule(item, settings.mode, today);
  const nextIndex = item.reviews.length;
  const total = item.intervals.length;
  const done = Math.min(nextIndex, total);
  const nextDate = status === 'active' ? schedule[nextIndex]?.date : undefined;

  const confirmDelete = () =>
    Alert.alert('Удалить блок?', `«${item.title}» и всю его историю повторений.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          router.back();
          store.deleteItem(item.id);
        },
      },
    ]);

  const confirmUnlearn = () =>
    Alert.alert('Вернуть в запланированные?', 'История повторений этого блока будет сброшена.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Вернуть', style: 'destructive', onPress: () => store.unlearn(item.id) },
    ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: item.title || 'Блок' }} />
      <Screen>
        <Card>
          <Label>Название</Label>
          <Input
            value={item.title}
            onChangeText={(title) => store.updateItem(item.id, { title })}
            placeholder="Слова 1–10"
          />
          <Label>Слова или заметка</Label>
          <Input
            value={item.note}
            onChangeText={(note) => store.updateItem(item.id, { note })}
            placeholder="Список слов, комментарий…"
            multiline
          />
        </Card>

        {status === 'planned' && (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label>Когда выучить</Label>
              <Badge tone="muted" text="запланировано" />
            </Row>
            <DateStepper
              value={item.plannedDate}
              onChange={(plannedDate) => store.updateItem(item.id, { plannedDate })}
              today={today}
            />
            <Button
              title="Выучил сегодня"
              icon="checkmark-circle-outline"
              variant="success"
              onPress={() => store.markLearned(item.id)}
            />
            <Hint>После отметки повторения распланируются по интервалам ниже.</Hint>
          </Card>
        )}

        {status !== 'planned' && item.learnedDate && (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label>Прогресс</Label>
              {status === 'finished' ? (
                <Badge tone="success" text="выучено навсегда" />
              ) : (
                <Badge text={`${done} из ${total}`} />
              )}
            </Row>
            <ProgressBar value={done} total={total} />
            {nextDate && (
              <Text style={{ color: c.text, fontSize: 16 }}>
                Следующее повторение:{' '}
                <Text style={{ fontWeight: '700', color: nextDate <= today ? c.warning : c.text }}>
                  {formatShort(nextDate)} ({relativeLabel(nextDate, today)})
                </Text>
              </Text>
            )}
            {nextDate && nextDate <= today && (
              <Button
                title="Повторил"
                icon="checkmark-circle-outline"
                variant="success"
                onPress={() => store.markReviewed(item.id)}
              />
            )}
            {nextDate && nextDate > today && (
              <Button
                title="Повторил досрочно"
                icon="checkmark-outline"
                variant="secondary"
                onPress={() => store.markReviewed(item.id)}
              />
            )}
            <Label>Дата изучения</Label>
            <DateStepper
              value={item.learnedDate}
              onChange={(learnedDate) => store.updateItem(item.id, { learnedDate })}
              today={today}
              max={item.reviews[0] && item.reviews[0] < today ? item.reviews[0] : today}
            />
          </Card>
        )}

        <SectionTitle>{status === 'planned' ? 'Будущие повторения (примерно)' : 'Расписание'}</SectionTitle>
        <Card style={{ gap: 0, paddingVertical: 6 }}>
          {schedule.length === 0 && <Hint>Интервалов нет — добавьте их ниже.</Hint>}
          {schedule.map((e) => {
            const isNext = status === 'active' && e.index === nextIndex;
            const overdue = isNext && e.date < today;
            return (
              <Row
                key={e.index}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: e.index === schedule.length - 1 ? 0 : 1,
                  borderBottomColor: c.border,
                }}>
                <Ionicons
                  name={e.doneDate ? 'checkmark-circle' : isNext ? 'radio-button-on' : 'ellipse-outline'}
                  size={22}
                  color={e.doneDate ? c.success : overdue ? c.warning : isNext ? c.primary : c.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: isNext ? '700' : '500' }}>
                    {e.index + 1}. {formatShort(e.doneDate ?? e.date)}
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 13 }}>
                    {e.doneDate
                      ? `повторено${e.doneDate !== e.date ? ` (по плану ${formatShort(e.date)})` : ''}`
                      : `${relativeLabel(e.date, today)} · интервал ${intervalLabel(e.interval)}`}
                  </Text>
                </View>
              </Row>
            );
          })}
        </Card>

        <SectionTitle>Интервалы этого блока</SectionTitle>
        <Card>
          <IntervalsEditor
            value={item.intervals}
            onChange={(v) => store.setItemIntervals(item.id, v)}
            onReset={
              item.customIntervals
                ? () =>
                    store.updateItem(item.id, {
                      intervals: [...settings.intervals],
                      customIntervals: false,
                    })
                : undefined
            }
          />
          <Hint>
            {item.customIntervals
              ? 'У этого блока свои интервалы.'
              : 'Используются интервалы по умолчанию из настроек.'}{' '}
            {settings.mode === 'fromLearned'
              ? 'Дни считаются от даты изучения.'
              : 'Дни считаются от предыдущего повторения.'}
          </Hint>
        </Card>

        <SectionTitle>Действия</SectionTitle>
        {item.reviews.length > 0 && (
          <Button
            title="Отменить последнее повторение"
            icon="arrow-undo-outline"
            variant="secondary"
            onPress={() => store.undoLastReview(item.id)}
          />
        )}
        {status !== 'planned' && (
          <Button
            title="Вернуть в запланированные"
            icon="refresh-outline"
            variant="secondary"
            onPress={confirmUnlearn}
          />
        )}
        <Button title="Удалить блок" icon="trash-outline" variant="danger" onPress={confirmDelete} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
