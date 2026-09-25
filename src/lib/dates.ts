// Dates are stored as local calendar days in the 'YYYY-MM-DD' format.

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const MONTHS_SHORT = [
  'янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.',
  'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.',
];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function addDays(s: string, days: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

/** Number of days from `a` to `b` (positive when `b` is later). */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function maxDate(a: string, b: string): string {
  return a > b ? a : b;
}

export function isValidDateStr(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function daysLabel(n: number): string {
  return `${n} ${plural(n, ['день', 'дня', 'дней'])}`;
}

/** "пт, 26 сент." */
export function formatShort(s: string): string {
  const d = parseDate(s);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "26 сентября 2026" */
export function formatLong(s: string): string {
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;
}

/** "сегодня" / "завтра" / "вчера" / "через 5 дней" / "3 дня назад" */
export function relativeLabel(s: string, today: string): string {
  const diff = diffDays(today, s);
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'завтра';
  if (diff === -1) return 'вчера';
  if (diff > 0) return `через ${daysLabel(diff)}`;
  return `${daysLabel(-diff)} назад`;
}

/** Human readable interval, e.g. "14 дней (2 нед.)". */
export function intervalLabel(days: number): string {
  const base = daysLabel(days);
  if (days >= 7 && days % 7 === 0 && days < 60) return `${base} · ${days / 7} нед.`;
  if (days >= 30 && days % 30 === 0) return `${base} · ${days / 30} мес.`;
  return base;
}

/** Short chip label: "5 д", "2 нед", "1 мес". */
export function intervalChip(days: number): string {
  if (days >= 30 && days % 30 === 0) return `${days / 30} мес`;
  if (days >= 7 && days % 7 === 0) return `${days / 7} нед`;
  return `${days} д`;
}
