import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Pressable, type ColorValue } from 'react-native';

import type { IconName } from '@/components/ui';
import { useColors } from '@/lib/theme';

function icon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
  };
}

export default function TabLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTitleStyle: { color: c.text },
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        sceneStyle: { backgroundColor: c.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Сегодня',
          tabBarIcon: icon('today-outline'),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/guide')}
              hitSlop={10}
              accessibilityLabel="Как это работает"
              style={{ marginRight: 16 }}>
              <Ionicons name="help-circle-outline" size={26} color={c.primary} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="plan" options={{ title: 'План', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="items" options={{ title: 'Все блоки', tabBarIcon: icon('albums-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Настройки', tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
