"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type UseJsDosPlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useJsDosPlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseJsDosPlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const [dosReady, setDosReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadRuntime = async () => {
      if (window.Dos) {
        setDosReady(true);
        return;
      }

      try {
        await import("js-dos/dist/js-dos.js");
        setDosReady(Boolean(window.Dos));
      } catch {
        setDosReady(false);
      }
    };

    void loadRuntime();
  }, []);

  useEffect(() => {
    if (!selectedGame || selectedGame.mode !== "jsdos" || !mountRef.current || !window.Dos) {
      return;
    }

    const mount = mountRef.current;
    mount.innerHTML = "";
    const host = document.createElement("div");
    host.style.width = "100%";
    host.style.height = "100%";
    host.style.minHeight = "280px";
    mount.appendChild(host);
    rootRef.current = host;

    setPlayerStatus("loading dos bundle");

    const options = {
      pathPrefix: "/emulators/",
      url: selectedGame.path,
      autoStart: true,
      background: false,
      fullScreen: false,
      theme: "dark",
      workerThread: false,
    };

    try {
      window.Dos?.(host, options);
      setPlayerStatus("live");
      setNotice(`${selectedGame.title} booted`);
    } catch {
      setPlayerStatus("dos bundle error");
      setNotice("js dos could not load this bundle");
    }

    return () => {
      if (rootRef.current) {
        rootRef.current.innerHTML = "";
      }
      mount.innerHTML = "";
      rootRef.current = null;
    };
  }, [mountRef, reloadToken, selectedGame, setNotice]);

  return {
    dosReady,
    playerStatus,
    setDosReady,
    setPlayerStatus,
  };
}
