import Ionicons from '@expo/vector-icons/Ionicons';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

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
      <Tabs.Screen name="index" options={{ title: 'Сегодня', tabBarIcon: icon('today-outline') }} />
      <Tabs.Screen name="plan" options={{ title: 'План', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="items" options={{ title: 'Все блоки', tabBarIcon: icon('albums-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Настройки', tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
