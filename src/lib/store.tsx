import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { todayStr } from './dates';
import { getStatus, normalizeIntervals, reviewsToMark } from './schedule';
import { EMPTY_DATA, loadData, saveData } from './storage';
import type { AppData, Item, Settings } from './types';

export interface NewItem {
  title: string;
  note: string;
  plannedDate: string;
  /** If true the block is already learned on plannedDate and reviews start right away. */
  learned: boolean;
}

interface Store {
  loaded: boolean;
  today: string;
  items: Item[];
  settings: Settings;
  addItems: (items: NewItem[]) => void;
  updateItem: (id: string, patch: Partial<Omit<Item, 'id'>>) => void;
  deleteItem: (id: string) => void;
  markLearned: (id: string) => void;
  markReviewed: (id: string) => void;
  undoLastReview: (id: string) => void;
  unlearn: (id: string) => void;
  setItemIntervals: (id: string, intervals: number[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  applyIntervalsToAll: () => void;
  replaceData: (data: AppData) => void;
  exportData: () => AppData;
}

const StoreContext = createContext<Store | null>(null);

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Keeps "today" up to date when the app stays open over midnight or is resumed. */
function useToday() {
  const [today, setToday] = useState(todayStr);
  useEffect(() => {
    const refresh = () => setToday(todayStr());
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const timer = setInterval(refresh, 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);
  return today;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const today = useToday();

  useEffect(() => {
    loadData()
      .then(setData)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) saveData(data).catch(() => {});
  }, [data, loaded]);

  const mapItem = useCallback((id: string, fn: (item: Item, d: AppData) => Item) => {
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? fn(it, d) : it)) }));
  }, []);

  const store = useMemo<Store>(
    () => ({
      loaded,
      today,
      items: data.items,
      settings: data.settings,

      addItems: (newItems) =>
        setData((d) => ({
          ...d,
          items: [
            ...d.items,
            ...newItems.map((n, i) => ({
              id: newId(),
              title: n.title.trim(),
              note: n.note.trim(),
              plannedDate: n.plannedDate,
              learnedDate: n.learned ? n.plannedDate : null,
              intervals: [...d.settings.intervals],
              customIntervals: false,
              reviews: [],
              createdAt: Date.now() + i,
            })),
          ],
        })),

      updateItem: (id, patch) => mapItem(id, (it) => ({ ...it, ...patch })),

      deleteItem: (id) => setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) })),

      markLearned: (id) =>
        mapItem(id, (it, d) => ({
          ...it,
          learnedDate: today,
          reviews: [],
          intervals: it.customIntervals ? it.intervals : [...d.settings.intervals],
        })),

      markReviewed: (id) =>
        mapItem(id, (it, d) => {
          const count = reviewsToMark(it, d.settings.mode, today);
          return { ...it, reviews: [...it.reviews, ...Array<string>(count).fill(today)] };
        }),

      undoLastReview: (id) => mapItem(id, (it) => ({ ...it, reviews: it.reviews.slice(0, -1) })),

      unlearn: (id) =>
        mapItem(id, (it) => ({
          ...it,
          learnedDate: null,
          reviews: [],
          plannedDate: it.learnedDate ?? it.plannedDate,
        })),

      setItemIntervals: (id, intervals) =>
        mapItem(id, (it) => ({ ...it, intervals: normalizeIntervals(intervals), customIntervals: true })),

      updateSettings: (patch) =>
        setData((d) => ({
          ...d,
          settings: {
            ...d.settings,
            ...patch,
            ...(patch.intervals ? { intervals: normalizeIntervals(patch.intervals) } : null),
          },
        })),

      applyIntervalsToAll: () =>
        setData((d) => ({
          ...d,
          items: d.items.map((it) =>
            getStatus(it) === 'finished'
              ? it
              : { ...it, intervals: [...d.settings.intervals], customIntervals: false },
          ),
        })),

      replaceData: (next) => setData(next),

      exportData: () => data,
    }),
    [data, loaded, today, mapItem],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
