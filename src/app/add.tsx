import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Switch, Text, View } from 'react-native';

import { Button, Card, Chip, DateStepper, Hint, Input, Label, Row, Screen, styles } from '@/components/ui';
import { addDays, formatShort, plural } from '@/lib/dates';
import { useStore, type NewItem } from '@/lib/store';
import { useColors } from '@/lib/theme';

type Mode = 'range' | 'title';

const MAX_BLOCKS = 200;

function toInt(s: string) {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export default function AddScreen() {
  const c = useColors();
  const { today, addItems } = useStore();

  const [mode, setMode] = useState<Mode>('range');
  const [prefix, setPrefix] = useState('Слова');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [chunk, setChunk] = useState('');
  const [perDay, setPerDay] = useState(1);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today);
  const [learned, setLearned] = useState(false);

  // Build the list of blocks that will be created.
  let drafts: { title: string; date: string }[] = [];
  let error: string | null = null;
  if (mode === 'title') {
    if (title.trim()) drafts = [{ title: title.trim(), date }];
  } else {
    const a = toInt(from);
    const b = toInt(to) ?? a;
    const size = toInt(chunk);
    const name = prefix.trim();
    if (a !== null && b !== null) {
      if (b < a) {
        error = '«По» должно быть больше или равно «С».';
      } else if (!size || size <= 0 || size >= b - a + 1) {
        drafts = [{ title: `${name} ${a === b ? a : `${a}–${b}`}`.trim(), date }];
      } else {
        const count = Math.ceil((b - a + 1) / size);
        if (count > MAX_BLOCKS) {
          error = `Слишком много блоков (${count}). Максимум — ${MAX_BLOCKS}.`;
        } else {
          for (let i = 0; i < count; i++) {
            const start = a + i * size;
            const end = Math.min(b, start + size - 1);
            drafts.push({
              title: `${name} ${start === end ? start : `${start}–${end}`}`.trim(),
              date: addDays(date, Math.floor(i / perDay)),
            });
          }
        }
      }
    }
  }

  const multiple = drafts.length > 1;
  const canBeLearned = !multiple && date <= today;
  const isLearned = learned && canBeLearned;

  const save = () => {
    if (!drafts.length) return;
    const items: NewItem[] = drafts.map((d) => ({
      title: d.title,
      note: multiple ? '' : note,
      plannedDate: d.date,
      learned: isLearned,
    }));
    addItems(items);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={styles.chipRow}>
          <Chip label="Диапазон номеров" active={mode === 'range'} onPress={() => setMode('range')} />
          <Chip label="Своё название" active={mode === 'title'} onPress={() => setMode('title')} />
        </View>

        {mode === 'range' ? (
          <Card>
            <Label>Что учим</Label>
            <Input value={prefix} onChangeText={setPrefix} placeholder="Слова" />
            <Row>
              <View style={{ flex: 1, gap: 6 }}>
                <Label>С</Label>
                <Input
                  value={from}
                  onChangeText={(t) => setFrom(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="1"
                />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Label>По</Label>
                <Input
                  value={to}
                  onChangeText={(t) => setTo(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="10"
                />
              </View>
            </Row>
            <Label>Разбить на блоки по (необязательно)</Label>
            <Input
              value={chunk}
              onChangeText={(t) => setChunk(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="например, 10"
            />
            <Hint>
              Например: с 1 по 100 по 10 — создастся 10 блоков (1–10, 11–20, …), по одному на каждый день.
            </Hint>
            {multiple && (
              <>
                <Label>Блоков в день</Label>
                <View style={styles.chipRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Chip key={n} label={String(n)} active={perDay === n} onPress={() => setPerDay(n)} />
                  ))}
                </View>
              </>
            )}
          </Card>
        ) : (
          <Card>
            <Label>Название</Label>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Например: Слова 100–110 или Урок 5"
              autoFocus
            />
          </Card>
        )}

        {!multiple && (
          <Card>
            <Label>Слова или заметка (необязательно)</Label>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder={'apple — яблоко\nhouse — дом'}
              multiline
            />
          </Card>
        )}

        <Card>
          <Label>{isLearned ? 'Когда выучил' : multiple ? 'Начать с' : 'Когда выучить'}</Label>
          <DateStepper value={date} onChange={setDate} today={today} />
          {!multiple && (
            <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>Уже выучил</Text>
                <Hint>
                  {canBeLearned
                    ? 'Повторения начнут планироваться сразу от этой даты.'
                    : 'Доступно только для сегодняшней или прошедшей даты.'}
                </Hint>
              </View>
              <Switch
                value={isLearned}
                onValueChange={setLearned}
                disabled={!canBeLearned}
                trackColor={{ true: c.success, false: c.border }}
              />
            </Row>
          )}
        </Card>

        {error ? <Text style={{ color: c.danger, fontWeight: '600' }}>{error}</Text> : null}

        {drafts.length > 0 && (
          <Card>
            <Label>
              Будет {plural(drafts.length, ['создан', 'создано', 'создано'])} {drafts.length}{' '}
              {plural(drafts.length, ['блок', 'блока', 'блоков'])}
            </Label>
            {drafts.slice(0, 6).map((d, i) => (
              <Row key={i} style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: c.text, fontSize: 15, flex: 1 }} numberOfLines={1}>
                  {d.title}
                </Text>
                <Text style={{ color: c.muted }}>{formatShort(d.date)}</Text>
              </Row>
            ))}
            {drafts.length > 6 && <Hint>… и ещё {drafts.length - 6}</Hint>}
          </Card>
        )}

        <Button
          title={isLearned ? 'Добавить и начать повторять' : 'Добавить'}
          icon="add-circle-outline"
          onPress={save}
          disabled={!drafts.length}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}
