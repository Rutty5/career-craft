import type { HistoryItem } from "./types";

const STORAGE_KEY = "career-craft-history";
const MAX_ITEMS = 50;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveHistory(item: HistoryItem): void {
  if (!isBrowser()) return;
  const history = getHistory();
  history.unshift(item);
  if (history.length > MAX_ITEMS) {
    history.splice(MAX_ITEMS);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): HistoryItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function getHistoryById(id: string): HistoryItem | null {
  const history = getHistory();
  return history.find((item) => item.id === id) ?? null;
}

export function deleteHistory(id: string): void {
  if (!isBrowser()) return;
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
