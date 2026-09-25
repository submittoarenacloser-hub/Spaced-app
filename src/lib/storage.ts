import AsyncStorage from '@react-native-async-storage/async-storage';

import { isValidDateStr } from './dates';
import { normalizeIntervals } from './schedule';
import { DEFAULT_SETTINGS, type AppData, type Item, type ReminderSettings } from './types';

const STORAGE_KEY = 'spaced-app/data/v1';

export const EMPTY_DATA: AppData = { items: [], settings: DEFAULT_SETTINGS };

function sanitizeItem(raw: any): Item | null {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null;
  if (!isValidDateStr(raw.plannedDate)) return null;
  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : '',
    note: typeof raw.note === 'string' ? raw.note : '',
    plannedDate: raw.plannedDate,
    learnedDate: isValidDateStr(raw.learnedDate) ? raw.learnedDate : null,
    intervals: Array.isArray(raw.intervals) ? normalizeIntervals(raw.intervals.map(Number)) : [],
    customIntervals: raw.customIntervals === true,
    reviews: Array.isArray(raw.reviews) ? raw.reviews.filter(isValidDateStr) : [],
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function sanitizeReminder(raw: any): ReminderSettings {
  const def = DEFAULT_SETTINGS.reminder;
  if (!raw || typeof raw !== 'object') return def;
  const hour = Number.isInteger(raw.hour) && raw.hour >= 0 && raw.hour < 24 ? raw.hour : def.hour;
  const minute = Number.isInteger(raw.minute) && raw.minute >= 0 && raw.minute < 60 ? raw.minute : def.minute;
  return { enabled: raw.enabled === true, hour, minute };
}

/** Validates data loaded from storage or pasted by the user as a backup. */
export function parseData(json: string): AppData {
  const raw = JSON.parse(json);
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) {
    throw new Error('Неверный формат данных');
  }
  const settingsRaw = raw.settings ?? {};
  const intervals = Array.isArray(settingsRaw.intervals)
    ? normalizeIntervals(settingsRaw.intervals.map(Number))
    : [];
  return {
    items: raw.items.map(sanitizeItem).filter((i: Item | null): i is Item => i !== null),
    settings: {
      intervals: intervals.length ? intervals : DEFAULT_SETTINGS.intervals,
      mode: settingsRaw.mode === 'fromPrevious' ? 'fromPrevious' : 'fromLearned',
      reminder: sanitizeReminder(settingsRaw.reminder),
    },
  };
}

export async function loadData(): Promise<AppData> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return EMPTY_DATA;
  try {
    return parseData(json);
  } catch {
    return EMPTY_DATA;
  }
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
