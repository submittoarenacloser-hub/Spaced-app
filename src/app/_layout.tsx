import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { StoreProvider, useStore } from '@/lib/store';
import { useColors, useIsDark } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { loaded } = useStore();
  const c = useColors();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.primary,
        headerTitleStyle: { color: c.text },
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'Новый блок', presentation: 'modal' }} />
      <Stack.Screen name="item/[id]" options={{ title: 'Блок' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const isDark = useIsDark();
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StoreProvider>
        <RootStack />
      </StoreProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
