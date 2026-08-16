"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UseSegaPlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useSegaPlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseSegaPlayerOptions) {
  const { playerStatus, ready, setPlayerStatus, setReady } = useLibretroPlayer({
    core: "genesis_plus_gx",
    label: "sega",
    mode: "sega",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return {
    playerStatus,
    segaReady: ready,
    setPlayerStatus,
    setSegaReady: setReady,
  };
}
