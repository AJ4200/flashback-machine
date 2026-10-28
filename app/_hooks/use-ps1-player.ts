"use client";

import type { RefObject } from "react";
import type { Game } from "../_lib/types";
import { useLibretroPlayer } from "./use-libretro-player";

type UsePs1PlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function usePs1Player({ mountRef, reloadToken, selectedGame, setNotice }: UsePs1PlayerOptions) {
  const { playerStatus, ready } = useLibretroPlayer({
    core: "pcsx_rearmed",
    label: "ps1",
    mode: "ps1",
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });

  return { playerStatus, ps1Ready: ready };
}
