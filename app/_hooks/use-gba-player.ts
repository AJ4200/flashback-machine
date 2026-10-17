"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UseGbaPlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useGbaPlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseGbaPlayerOptions) {
  const { playerStatus, ready } = useLibretroPlayer({
    core: "mgba",
    label: "gba",
    mode: "gba",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return { playerStatus, ready };
}
