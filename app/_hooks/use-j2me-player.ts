"use client";

import { useEffect, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type UseJ2mePlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

// FreeJ2ME (CheerpJ) is self-hosted in public/freej2me and reads jars from /freej2me/jar/<file>,
// which next.config.ts rewrites to /games/j2me/<file>.
export function useJ2mePlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseJ2mePlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");

  useEffect(() => {
    if (!selectedGame || selectedGame.mode !== "j2me" || !mountRef.current) {
      return;
    }

    const mount = mountRef.current;
    const fileName = selectedGame.path.split("/").pop() ?? "";
    if (!fileName.toLowerCase().endsWith(".jar")) {
      queueMicrotask(() => {
        setPlayerStatus("j2me runtime error: only .jar files are supported");
        setNotice("j2me needs a .jar file");
      });
      return;
    }

    const frame = document.createElement("iframe");
    frame.title = `${selectedGame.title} (Java ME)`;
    frame.allow = "autoplay; fullscreen";
    frame.style.cssText = "width:100%;height:100%;min-height:280px;border:0;background:#000;";
    frame.addEventListener("load", () => {
      setPlayerStatus("live");
      setNotice(`${selectedGame.title} booted`);
      frame.focus();
    });
    frame.src = `/freej2me/run.html?jar=${encodeURIComponent(fileName)}`;
    mount.replaceChildren(frame);
    queueMicrotask(() => setPlayerStatus("loading java runtime"));

    return () => {
      frame.src = "about:blank";
      mount.replaceChildren();
    };
  }, [mountRef, reloadToken, selectedGame, setNotice]);

  return { j2meReady: true, playerStatus };
}
