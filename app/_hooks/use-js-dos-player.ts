"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import "../jsdos-scoped.css";
import type { Game, JsDosPlayerHandle } from "../_lib/types";

type UseJsDosPlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function useJsDosPlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseJsDosPlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const [dosReady, setDosReady] = useState(false);
  const dosInstanceRef = useRef<JsDosPlayerHandle | null>(null);

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
        if (!window.Dos) {
          setPlayerStatus("DOS runtime error: js-dos API unavailable");
        }
      } catch (error) {
        setDosReady(false);
        setPlayerStatus(`DOS runtime error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    void loadRuntime();
  }, []);

  useEffect(() => {
    if (!dosReady || !selectedGame || selectedGame.mode !== "jsdos" || !mountRef.current || !window.Dos) {
      return;
    }

    const mount = mountRef.current;
    mount.innerHTML = "";
    const host = document.createElement("div");
    host.style.width = "100%";
    host.style.height = "100%";
    host.style.minHeight = "280px";
    mount.appendChild(host);

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
      dosInstanceRef.current = window.Dos(host, options);
      setPlayerStatus("live");
      setNotice(`${selectedGame.title} booted`);
    } catch (error) {
      setPlayerStatus(`DOS bundle error: ${error instanceof Error ? error.message : String(error)}`);
      setNotice("js dos could not load this bundle");
    }

    return () => {
      const dosInstance = dosInstanceRef.current;
      dosInstanceRef.current = null;
      if (dosInstance) {
        void dosInstance.stop().catch((error: unknown) => {
          console.error("Could not stop the DOS runtime", error);
        });
      }
      mount.replaceChildren();
    };
  }, [dosReady, mountRef, reloadToken, selectedGame, setNotice]);

  return {
    dosReady,
    playerStatus,
    setDosReady,
    setPlayerStatus,
  };
}
