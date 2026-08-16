"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UseMamePlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useMamePlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseMamePlayerOptions) {
  const { playerStatus, ready, setPlayerStatus, setReady } = useLibretroPlayer({
    core: "mame2003_plus",
    label: "mame",
    mode: "mame",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return {
    mameReady: ready,
    playerStatus,
    setPlayerStatus,
    setMameReady: setReady,
  };
}
