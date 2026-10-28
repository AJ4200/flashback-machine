"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UseJ2mePlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useJ2mePlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseJ2mePlayerOptions) {
  const { playerStatus, ready } = useLibretroPlayer({
    core: "squirreljme",
    label: "j2me",
    mode: "j2me",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return { j2meReady: ready, playerStatus };
}
