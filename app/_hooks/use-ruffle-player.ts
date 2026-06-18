"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game, RufflePlayerElement } from "../_lib/types";

type UseRufflePlayerOptions = {
  effectiveVolume: number;
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

const applyPlayerVolume = (player: RufflePlayerElement | null, effectiveVolume: number) => {
  if (!player) {
    return;
  }

  const normalizedVolume = Math.min(1, Math.max(0, effectiveVolume / 100));

  player.volume = normalizedVolume;
  const ruffleApi = player.ruffle?.();

  if (ruffleApi) {
    ruffleApi.volume = normalizedVolume;
  }
};

export function useRufflePlayer({ effectiveVolume, mountRef, reloadToken, selectedGame, setNotice }: UseRufflePlayerOptions) {
  const [ruffleReady, setRuffleReady] = useState(false);
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const playerRef = useRef<RufflePlayerElement | null>(null);

  useEffect(() => {
    if (window.RufflePlayer) {
      setRuffleReady(true);
    }
  }, []);

  useEffect(() => {
    if (!selectedGame) {
      playerRef.current = null;
      setPlayerStatus("waiting for game");
      return;
    }

    if (!ruffleReady || !window.RufflePlayer || !mountRef.current) {
      return;
    }

    window.RufflePlayer.config = {
      ...window.RufflePlayer.config,
      autoplay: "on",
      contextMenu: "on",
      letterbox: "on",
      unmuteOverlay: "hidden",
      volume: effectiveVolume / 100,
      warnOnUnsupportedContent: false,
    };

    const mount = mountRef.current;
    mount.innerHTML = "";
    setPlayerStatus("loading cartridge");

    const player = window.RufflePlayer.newest().createPlayer();
    player.className = "ruffle-player";
    player.style.width = "100%";
    player.style.height = "100%";
    playerRef.current = player;
    applyPlayerVolume(player, effectiveVolume);
    mount.appendChild(player);

    const ruffleApi = player.ruffle?.();
    const load = ruffleApi?.load ?? player.load;

    if (!load) {
      setPlayerStatus("ruffle api unavailable");
      return;
    }

    load.call(ruffleApi ?? player, { url: selectedGame.path, autoplay: "on" })
      .then(() => {
        setPlayerStatus("live");
        setNotice(`${selectedGame.title} inserted`);
      })
      .catch(() => {
        setPlayerStatus("cartridge error");
        setNotice("ruffle could not load this swf");
      });

    return () => {
      playerRef.current = null;
      mount.innerHTML = "";
    };
  }, [mountRef, reloadToken, ruffleReady, selectedGame, setNotice]);

  useEffect(() => {
    applyPlayerVolume(playerRef.current, effectiveVolume);
  }, [effectiveVolume]);

  return {
    playerStatus,
    ruffleReady,
    setPlayerStatus,
    setRuffleReady,
  };
}
