"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type UseNesPlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useNesPlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseNesPlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const [nesReady, setNesReady] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedGame || selectedGame.mode !== "nes") {
      playerRef.current?.destroy?.();
      playerRef.current = null;
      setPlayerStatus("waiting for game");
      return;
    }

    if (!mountRef.current) {
      return;
    }

    let cancelled = false;
    const mount = mountRef.current;
    mount.innerHTML = "";

    const host = document.createElement("div");
    host.style.width = "100%";
    host.style.height = "100%";
    host.style.minHeight = "280px";
    mount.appendChild(host);

    const loadNes = async () => {
      try {
        setPlayerStatus("loading nes bundle");
        const jsnesModule = (await import("jsnes")) as any;
        if (cancelled) {
          return;
        }

        const Browser = jsnesModule.Browser ?? jsnesModule.default?.Browser;
        if (!Browser) {
          setPlayerStatus("nes runtime unavailable");
          setNotice("NES runtime could not be initialized");
          return;
        }

        setNesReady(true);

        Browser.loadROMFromURL(selectedGame.path, (error: Error | null, romData?: string) => {
          if (cancelled) {
            return;
          }

          if (error || !romData) {
            console.error(error);
            setPlayerStatus("nes bundle error");
            setNotice("NES could not load this rom");
            return;
          }

          const browser = new Browser({
            container: host,
            romData,
            onError: (error: unknown) => {
              console.error(error);
              setPlayerStatus("nes runtime error");
              setNotice("NES runtime encountered an error");
            },
          });

          playerRef.current = browser;
          setPlayerStatus("live");
          setNotice(`${selectedGame.title} inserted`);
        });
      } catch (error) {
        console.error(error);
        setPlayerStatus("nes bundle error");
        setNotice("NES could not load this rom");
      }
    };

    void loadNes();

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [mountRef, reloadToken, selectedGame, setNotice]);

  return {
    nesReady,
    playerStatus,
    setPlayerStatus,
    setNesReady,
  };
}
