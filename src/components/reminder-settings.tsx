import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Linking, Pressable, Switch, Text, View } from 'react-native';

import { ensurePermission, notificationsSupported } from '@/lib/notifications';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';

import { Card, Chip, Hint, Row, styles } from './ui';

const PRESETS: [number, number][] = [
  [8, 0],
  [9, 0],
  [12, 0],
  [19, 0],
  [21, 0],
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function Stepper({ value, onChange }: { value: string; onChange: (delta: number) => void }) {
  const c = useColors();
  return (
    <View style={[styles.stepper, { borderColor: c.border, backgroundColor: c.background, gap: 10 }]}>
      <Pressable onPress={() => onChange(-1)} hitSlop={10} accessibilityLabel="Меньше">
        <Ionicons name="chevron-back" size={22} color={c.primary} />
      </Pressable>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: '700', minWidth: 32, textAlign: 'center' }}>
        {value}
      </Text>
      <Pressable onPress={() => onChange(1)} hitSlop={10} accessibilityLabel="Больше">
        <Ionicons name="chevron-forward" size={22} color={c.primary} />
      </Pressable>
    </View>
  );
}

export function ReminderSettings() {
  const c = useColors();
  const { settings, updateSettings } = useStore();
  const { reminder } = settings;

  const setTime = (hour: number, minute: number) =>
    updateSettings({ reminder: { ...reminder, hour, minute } });

  const toggle = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ reminder: { ...reminder, enabled: false } });
      return;
    }
    const allowed = await ensurePermission();
    if (allowed) {
      updateSettings({ reminder: { ...reminder, enabled: true } });
    } else {
      Alert.alert(
        'Уведомления выключены',
        'Разрешите уведомления для приложения «Повторения» в настройках телефона.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  if (!notificationsSupported) {
    return (
      <Card>
        <Hint>Напоминания работают только в приложении на телефоне.</Hint>
      </Card>
    );
  }

  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>Напоминать каждый день</Text>
          <Hint>
            Уведомление придёт только в дни, когда есть что выучить или повторить, и покажет, какие блоки.
          </Hint>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={toggle}
          trackColor={{ true: c.success, false: c.border }}
        />
      </Row>

      {reminder.enabled && (
        <>
          <Row style={{ justifyContent: 'center', marginTop: 4 }}>
            <Stepper
              value={pad(reminder.hour)}
              onChange={(d) => setTime((reminder.hour + d + 24) % 24, reminder.minute)}
            />
            <Text style={{ color: c.text, fontSize: 22, fontWeight: '700' }}>:</Text>
            <Stepper
              value={pad(reminder.minute)}
              onChange={(d) => setTime(reminder.hour, (reminder.minute + d * 5 + 60) % 60)}
            />
          </Row>
          <View style={[styles.chipRow, { justifyContent: 'center' }]}>
            {PRESETS.map(([h, m]) => (
              <Chip
                key={`${h}:${m}`}
                label={`${pad(h)}:${pad(m)}`}
                active={reminder.hour === h && reminder.minute === m}
                onPress={() => setTime(h, m)}
              />
            ))}
          </View>
        </>
      )}
    </Card>
  );
}
