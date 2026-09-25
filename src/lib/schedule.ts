import { addDays, diffDays, maxDate } from './dates';
import type { Item, ScheduleMode } from './types';

export type ItemStatus = 'planned' | 'active' | 'finished';

export interface ScheduleEntry {
  index: number;
  interval: number;
  /** Scheduled (or, for future reviews, projected) date. */
  date: string;
  /** Day the review was done, null if not yet. */
  doneDate: string | null;
}

export function getStatus(item: Item): ItemStatus {
  if (!item.learnedDate) return 'planned';
  return item.reviews.length >= item.intervals.length ? 'finished' : 'active';
}

/** Normalizes a user-entered list of intervals: positive integers, sorted, unique. */
export function normalizeIntervals(list: number[]): number[] {
  const clean = list
    .map((n) => Math.round(n))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 3650);
  return Array.from(new Set(clean)).sort((a, b) => a - b);
}

/**
 * Full review plan for a block. For planned blocks it is a preview assuming the
 * block gets learned on its planned day (or today, if that day has passed).
 */
export function getSchedule(item: Item, mode: ScheduleMode, today: string): ScheduleEntry[] {
  const start = item.learnedDate ?? maxDate(item.plannedDate, today);
  let prev = start;
  return item.intervals.map((interval, index) => {
    const doneDate = item.learnedDate ? (item.reviews[index] ?? null) : null;
    const date = addDays(mode === 'fromLearned' ? start : prev, interval);
    // Pending reviews are projected assuming they are done on time (or today if overdue).
    prev = doneDate ?? maxDate(date, today);
    return { index, interval, date, doneDate };
  });
}

/** Date of the next pending review of an active block. */
export function getNextReviewDate(item: Item, mode: ScheduleMode, today: string): string | null {
  if (getStatus(item) !== 'active') return null;
  return getSchedule(item, mode, today)[item.reviews.length]?.date ?? null;
}

/** Date the block needs attention next: planned learning day or next review. */
export function getNextActionDate(item: Item, mode: ScheduleMode, today: string): string | null {
  const status = getStatus(item);
  if (status === 'planned') return item.plannedDate;
  if (status === 'active') return getNextReviewDate(item, mode, today);
  return null;
}

export function overdueDays(date: string, today: string): number {
  return Math.max(0, diffDays(date, today));
}

/**
 * Number of reviews that doing a review today closes. Normally 1, but in the
 * fromLearned mode missed reviews whose dates have all passed are closed at once,
 * so the block does not come back several times on the same day.
 */
export function reviewsToMark(item: Item, mode: ScheduleMode, today: string): number {
  if (getStatus(item) !== 'active') return 0;
  if (mode !== 'fromLearned') return 1;
  const schedule = getSchedule(item, mode, today);
  let count = 1;
  for (let i = item.reviews.length + 1; i < schedule.length && schedule[i].date <= today; i++) {
    count++;
  }
  return count;
}

export interface PlanEntry {
  key: string;
  item: Item;
  kind: 'learn' | 'review';
  date: string;
  /** Review number, 1-based. */
  number: number;
  total: number;
}

/** All upcoming actions (learning + pending reviews) across blocks, sorted by date. */
export function buildPlan(items: Item[], mode: ScheduleMode, today: string): PlanEntry[] {
  const entries: PlanEntry[] = [];
  for (const item of items) {
    const status = getStatus(item);
    if (status === 'planned') {
      entries.push({
        key: `${item.id}-learn`,
        item,
        kind: 'learn',
        date: item.plannedDate,
        number: 0,
        total: item.intervals.length,
      });
    } else if (status === 'active') {
      // Missed reviews that the next review closes together are not listed (see reviewsToMark).
      const next = item.reviews.length;
      const closedTogether = reviewsToMark(item, mode, today);
      for (const entry of getSchedule(item, mode, today)) {
        if (entry.doneDate) continue;
        if (entry.index > next && entry.index < next + closedTogether) continue;
        entries.push({
          key: `${item.id}-${entry.index}`,
          item,
          kind: 'review',
          date: entry.date,
          number: entry.index + 1,
          total: item.intervals.length,
        });
      }
    }
  }
  return entries.sort(
    (a, b) => a.date.localeCompare(b.date) || a.item.title.localeCompare(b.item.title, 'ru'),
  );
}
