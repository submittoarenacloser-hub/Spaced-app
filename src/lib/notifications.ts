import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { addDays, parseDate } from './dates';
import { buildPlan } from './schedule';
import type { Item, Settings } from './types';

const CHANNEL_ID = 'reminders';
/** How many days ahead reminders are scheduled; refreshed every time the app changes data or opens. */
const DAYS_AHEAD = 30;
const MAX_TITLES = 4;

export const notificationsSupported = Platform.OS !== 'web';

if (notificationsSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Напоминания о повторении',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/** Asks for notification permission if needed. Returns true when notifications are allowed. */
export async function ensurePermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  // Android 13+ only shows the permission prompt once a channel exists.
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function listTitles(items: Item[]): string {
  const titles = items.map((it) => it.title || 'Без названия');
  const shown = titles.slice(0, MAX_TITLES).join(', ');
  return titles.length > MAX_TITLES ? `${shown} и ещё ${titles.length - MAX_TITLES}` : shown;
}

/** Text of the reminder for one day, or null when there is nothing to do. */
export function reminderContent(
  items: Item[],
  settings: Settings,
  today: string,
  day: string,
): { title: string; body: string } | null {
  // Anything not done by then is still waiting on that day, so pending work accumulates.
  const entries = buildPlan(items, settings.mode, today).filter((e) => e.date <= day);
  const seen = new Set<string>();
  const toReview: Item[] = [];
  const toLearn: Item[] = [];
  for (const e of entries) {
    if (seen.has(e.item.id)) continue;
    seen.add(e.item.id);
    (e.kind === 'learn' ? toLearn : toReview).push(e.item);
  }
  if (!toReview.length && !toLearn.length) return null;

  const parts: string[] = [];
  if (toReview.length) parts.push(`Повторить: ${listTitles(toReview)}`);
  if (toLearn.length) parts.push(`Выучить: ${listTitles(toLearn)}`);
  const title = toReview.length ? 'Пора повторить слова' : 'Пора учить новые слова';
  return { title, body: parts.join('\n') };
}

/**
 * Replaces all scheduled reminders with one notification per day that has
 * something to learn or review, at the time chosen in settings.
 */
export async function syncReminders(items: Item[], settings: Settings, today: string): Promise<void> {
  if (!notificationsSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.reminder.enabled) return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;
  await ensureChannel();

  const now = Date.now();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = addDays(today, i);
    const at = parseDate(day);
    at.setHours(settings.reminder.hour, settings.reminder.minute, 0, 0);
    if (at.getTime() <= now) continue;
    const content = reminderContent(items, settings, today, day);
    if (!content) continue;
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ID },
    });
  }
}

let queue: Promise<void> = Promise.resolve();

/** Runs syncReminders calls one after another so cancel/schedule never interleave. */
export function requestReminderSync(items: Item[], settings: Settings, today: string) {
  queue = queue.then(() => syncReminders(items, settings, today)).catch(() => {});
}
