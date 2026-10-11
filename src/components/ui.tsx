import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { addDays, formatShort, intervalChip, relativeLabel } from '@/lib/dates';
import { useColors } from '@/lib/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps) {
  const c = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={[styles.screen, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: c.muted }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.label, { color: c.muted }]}>{children}</Text>;
}

export function Hint({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.hint, { color: c.muted }]}>{children}</Text>;
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  small,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const palette: Record<ButtonVariant, { bg: string; fg: string }> = {
    primary: { bg: c.primary, fg: c.onPrimary },
    secondary: { bg: c.primarySoft, fg: c.primary },
    success: { bg: c.success, fg: c.onPrimary },
    danger: { bg: c.dangerSoft, fg: c.danger },
    ghost: { bg: 'transparent', fg: c.primary },
  };
  const { bg, fg } = palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={small ? 16 : 20} color={fg} />}
      <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

/** Round check button used to mark a block learned / reviewed. */
export function CheckButton({ onPress, label }: { onPress: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.check,
        { borderColor: c.success, backgroundColor: pressed ? c.success : c.successSoft },
      ]}>
      {({ pressed }) => <Ionicons name="checkmark" size={26} color={pressed ? c.onPrimary : c.success} />}
    </Pressable>
  );
}

export function Badge({ text, tone = 'primary' }: { text: string; tone?: 'primary' | 'success' | 'danger' | 'warning' | 'muted' }) {
  const c = useColors();
  const map = {
    primary: [c.primarySoft, c.primary],
    success: [c.successSoft, c.success],
    danger: [c.dangerSoft, c.danger],
    warning: [c.warningSoft, c.warning],
    muted: [c.border, c.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const c = useColors();
  const pct = total > 0 ? Math.min(1, value / total) : 1;
  return (
    <View style={[styles.progress, { backgroundColor: c.border }]}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: c.success }]} />
    </View>
  );
}

export function Input(props: TextInputProps) {
  const c = useColors();
  return (
    <TextInput
      placeholderTextColor={c.muted}
      {...props}
      style={[
        styles.input,
        { color: c.text, borderColor: c.border, backgroundColor: c.background },
        props.multiline && styles.inputMultiline,
        props.style,
      ]}
    />
  );
}

export function Empty({ icon, title, text }: { icon: IconName; title: string; text?: string }) {
  const c = useColors();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={c.muted} />
      <Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text>
      {text ? <Text style={[styles.emptyText, { color: c.muted }]}>{text}</Text> : null}
    </View>
  );
}

export function Fab({ onPress }: { onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Добавить"
      style={({ pressed }) => [styles.fab, { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 }]}>
      <Ionicons name="add" size={32} color={c.onPrimary} />
    </Pressable>
  );
}

/** Day picker: ‹ date › with quick "today / tomorrow" chips. */
export function DateStepper({
  value,
  onChange,
  today,
  min,
  max,
}: {
  value: string;
  onChange: (date: string) => void;
  today: string;
  min?: string;
  max?: string;
}) {
  const c = useColors();
  const canGoBack = !min || value > min;
  const canGoForward = !max || value < max;
  return (
    <View style={{ gap: 10 }}>
      <View style={[styles.stepper, { borderColor: c.border, backgroundColor: c.background }]}>
        <Pressable
          disabled={!canGoBack}
          onPress={() => onChange(addDays(value, -1))}
          hitSlop={10}
          style={{ opacity: canGoBack ? 1 : 0.3 }}>
          <Ionicons name="chevron-back" size={24} color={c.primary} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.stepperDate, { color: c.text }]}>{formatShort(value)}</Text>
          <Text style={{ color: c.muted, fontSize: 13 }}>{relativeLabel(value, today)}</Text>
        </View>
        <Pressable
          disabled={!canGoForward}
          onPress={() => onChange(addDays(value, 1))}
          hitSlop={10}
          style={{ opacity: canGoForward ? 1 : 0.3 }}>
          <Ionicons name="chevron-forward" size={24} color={c.primary} />
        </Pressable>
      </View>
      <View style={styles.chipRow}>
        {[
          ['Сегодня', today],
          ['Завтра', addDays(today, 1)],
          ['Через неделю', addDays(today, 7)],
        ].map(([label, date]) =>
          (min && date < min) || (max && date > max) ? null : (
            <Chip key={label} label={label} active={value === date} onPress={() => onChange(date)} />
          ),
        )}
      </View>
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  onRemove,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? c.primary : c.primarySoft },
      ]}>
      <Text style={{ color: active ? c.onPrimary : c.primary, fontWeight: '600' }}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Удалить ${label}`}>
          <Ionicons name="close-circle" size={18} color={c.primary} />
        </Pressable>
      )}
    </Pressable>
  );
}

/** Editable list of review intervals (in days). */
export function IntervalsEditor({
  value,
  onChange,
  onReset,
}: {
  value: number[];
  onChange: (intervals: number[]) => void;
  onReset?: () => void;
}) {
  const [text, setText] = useState('');
  const days = parseInt(text, 10);
  const valid = Number.isFinite(days) && days > 0 && days <= 3650;
  const add = () => {
    if (!valid) return;
    onChange([...value, days]);
    setText('');
  };
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.chipRow}>
        {value.map((d, i) => (
          <Chip
            key={d}
            label={`${i + 1}) ${intervalChip(d)}`}
            onRemove={() => onChange(value.filter((x) => x !== d))}
          />
        ))}
        {value.length === 0 && <Hint>Интервалов нет — повторений не будет.</Hint>}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Input
          value={text}
          onChangeText={(t) => setText(t.replace(/[^0-9]/g, ''))}
          placeholder="Через сколько дней"
          keyboardType="number-pad"
          onSubmitEditing={add}
          returnKeyType="done"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button title="Добавить" icon="add" onPress={add} disabled={!valid} small />
      </View>
      <View style={styles.chipRow}>
        {[7, 14, 21, 30, 60, 90].map((d) =>
          value.includes(d) ? null : (
            <Chip key={d} label={`+ ${intervalChip(d)}`} onPress={() => onChange([...value, d])} />
          ),
        )}
      </View>
      {onReset && <Button title="Сбросить по умолчанию" variant="ghost" small onPress={onReset} />}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>{children}</View>;
}

export const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 110, gap: 12 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  label: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 13, lineHeight: 18 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  buttonSmall: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  buttonTextSmall: { fontSize: 14 },
  check: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  progress: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperDate: { fontSize: 17, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
});
