"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UsePcEnginePlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function usePcEnginePlayer({ mountRef, reloadToken, selectedGame, setNotice }: UsePcEnginePlayerOptions) {
  const { playerStatus, ready } = useLibretroPlayer({
    core: "mednafen_pce_fast",
    label: "pc engine",
    mode: "pcengine",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return { playerStatus, ready };
}
