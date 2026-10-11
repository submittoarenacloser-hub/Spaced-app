import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useColors } from '@/lib/theme';

export interface MemoryPoint {
  label: string;
  /** Share remembered, 0–100. */
  value: number;
}

const PLOT_HEIGHT = 110;

/**
 * Small single-series bar chart of how much is remembered over time.
 * Values are labelled on `labelled` bars; tapping any bar shows its value.
 */
export function MemoryChart({
  title,
  points,
  color,
  labelled,
}: {
  title: string;
  points: MemoryPoint[];
  color: string;
  labelled: number[];
}) {
  const c = useColors();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height: PLOT_HEIGHT + 22,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
          gap: 2,
        }}>
        {points.map((p, i) => {
          const showValue = selected === null ? labelled.includes(i) : selected === i;
          return (
            <Pressable
              key={p.label}
              onPress={() => setSelected(selected === i ? null : i)}
              accessibilityLabel={`${p.label}: ${p.value}%`}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <Text
                style={{
                  color: c.text,
                  fontSize: 13,
                  fontWeight: '700',
                  marginBottom: 4,
                  opacity: showValue ? 1 : 0,
                }}>
                {p.value}%
              </Text>
              <View
                style={{
                  width: '62%',
                  maxWidth: 34,
                  height: Math.max(2, (p.value / 100) * PLOT_HEIGHT),
                  backgroundColor: color,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  opacity: selected === null || selected === i ? 1 : 0.45,
                }}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {points.map((p) => (
          <Text key={p.label} style={{ flex: 1, textAlign: 'center', color: c.muted, fontSize: 12 }}>
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
