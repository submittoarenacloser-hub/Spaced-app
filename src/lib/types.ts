/**
 * fromLearned  – every interval is counted from the day the block was learned
 *                (1, 3, 7 → reviews on day 1, 3 and 7 after learning).
 * fromPrevious – every interval is counted from the previous review
 *                (1, 3, 7 → day 1, day 4, day 11).
 */
export type ScheduleMode = 'fromLearned' | 'fromPrevious';

export interface Item {
  id: string;
  /** e.g. "Слова 1–10" */
  title: string;
  /** Optional words list / comment. */
  note: string;
  /** Day the block is planned to be learned. */
  plannedDate: string;
  /** Day the block was actually learned; null while it is only planned. */
  learnedDate: string | null;
  /** Review intervals in days. */
  intervals: number[];
  /** True when intervals were edited for this block specifically. */
  customIntervals: boolean;
  /** Days on which reviews were done; reviews[i] belongs to intervals[i]. */
  reviews: string[];
  createdAt: number;
}

export interface Settings {
  intervals: number[];
  mode: ScheduleMode;
}

export interface AppData {
  items: Item[];
  settings: Settings;
}

export const DEFAULT_INTERVALS = [1, 3, 5, 7, 10, 14, 21, 30, 60];

export const DEFAULT_SETTINGS: Settings = {
  intervals: DEFAULT_INTERVALS,
  mode: 'fromLearned',
};
