import { useColorScheme } from 'react-native';

const light = {
  background: '#F4F5FA',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#4F46E5',
  primarySoft: '#EEF0FF',
  onPrimary: '#FFFFFF',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  chartForget: '#EA580C',
  chartRemember: '#4F46E5',
};

const dark: typeof light = {
  background: '#0B0B10',
  card: '#1A1B23',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  border: '#2D2F3A',
  primary: '#818CF8',
  primarySoft: '#262A4A',
  onPrimary: '#0B0B10',
  success: '#4ADE80',
  successSoft: '#163323',
  danger: '#F87171',
  dangerSoft: '#3B1717',
  warning: '#FBBF24',
  warningSoft: '#3A2C0C',
  chartForget: '#EA580C',
  chartRemember: '#6366F1',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}
