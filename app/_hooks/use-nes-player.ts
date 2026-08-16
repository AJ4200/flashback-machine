"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UseNesPlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useNesPlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseNesPlayerOptions) {
  const { playerStatus, ready, setPlayerStatus, setReady } = useLibretroPlayer({
    core: "nestopia",
    label: "nes",
    mode: "nes",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return {
    nesReady: ready,
    playerStatus,
    setPlayerStatus,
    setNesReady: setReady,
  };
}
