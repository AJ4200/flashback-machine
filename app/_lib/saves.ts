import { SAVE_PREFIX, STORAGE_PREFIX } from "./constants";
import type { GameMode, SaveSlot } from "./types";

export const saveKey = (mode: GameMode, file: string, slot: number) => `${SAVE_PREFIX}${mode}:${encodeURIComponent(file)}:${slot}`;

export const readSaveSlots = (mode: GameMode, file: string): SaveSlot[] => {
  if (typeof window === "undefined") {
    return [];
  }

  return [1, 2, 3].map((id) => {
    const raw = window.localStorage.getItem(saveKey(mode, file, id));

    if (!raw) {
      return { id, createdAt: null, count: 0 };
    }

    try {
      const parsed = JSON.parse(raw) as { createdAt?: string; storage?: Record<string, string> };

      return {
        id,
        createdAt: parsed.createdAt ?? null,
        count: parsed.storage ? Object.keys(parsed.storage).length : 0,
      };
    } catch {
      return { id, createdAt: null, count: 0 };
    }
  });
};

export const snapshotLocalStorage = () => {
  const storage: Record<string, string> = {};

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || key.startsWith(STORAGE_PREFIX)) {
      continue;
    }

    const value = window.localStorage.getItem(key);

    if (value !== null) {
      storage[key] = value;
    }
  }

  return storage;
};
