"use client";

import { useCallback, useEffect, useState } from "react";
import { LAST_GAME_KEY } from "../_lib/constants";
import { readSaveSlots, saveKey, snapshotLocalStorage } from "../_lib/saves";
import type { Game, SaveSlot } from "../_lib/types";

type UseSaveSlotsOptions = {
  onReload: () => void;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useSaveSlots({ onReload, selectedGame, setNotice }: UseSaveSlotsOptions) {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);

  const refreshSlots = useCallback((file: string) => {
    setSaveSlots(readSaveSlots(file));
  }, []);

  useEffect(() => {
    if (!selectedGame) {
      return;
    }

    window.localStorage.setItem(LAST_GAME_KEY, selectedGame.file);
    refreshSlots(selectedGame.file);
  }, [refreshSlots, selectedGame]);

  const saveSlot = (slot: number) => {
    if (!selectedGame) {
      return;
    }

    const storage = snapshotLocalStorage();

    window.localStorage.setItem(
      saveKey(selectedGame.file, slot),
      JSON.stringify({
        game: selectedGame.file,
        createdAt: new Date().toISOString(),
        storage,
      }),
    );
    refreshSlots(selectedGame.file);
    setNotice(`slot ${slot} saved`);
  };

  const loadSlot = (slot: number) => {
    if (!selectedGame) {
      return;
    }

    const raw = window.localStorage.getItem(saveKey(selectedGame.file, slot));

    if (!raw) {
      setNotice(`slot ${slot} is empty`);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { storage?: Record<string, string> };

      Object.entries(parsed.storage ?? {}).forEach(([key, value]) => {
        window.localStorage.setItem(key, value);
      });
      setNotice(`slot ${slot} loaded`);
      onReload();
    } catch {
      setNotice(`slot ${slot} failed`);
    }
  };

  const clearSlot = (slot: number) => {
    if (!selectedGame) {
      return;
    }

    window.localStorage.removeItem(saveKey(selectedGame.file, slot));
    refreshSlots(selectedGame.file);
    setNotice(`slot ${slot} cleared`);
  };

  return {
    clearSlot,
    loadSlot,
    saveSlot,
    saveSlots,
  };
}
