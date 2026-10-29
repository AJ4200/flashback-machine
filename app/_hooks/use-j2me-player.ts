"use client";

import { useEffect, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";
import { getAudioBusLevel } from "../_lib/audio-bus";

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

    // The runtime lives in a same-origin iframe the audio bus cannot patch, and its AudioContext stays
    // suspended until a gesture lands inside the frame (gamepad input never counts), so keep nudging it.
    type J2meWindow = Window & { libmidi?: { context?: AudioContext; _midiPlayer?: { gainNode?: GainNode } } };
    const syncAudio = () => {
      try {
        const frameWindow = frame.contentWindow as J2meWindow | null;
        const context = frameWindow?.libmidi?.context;
        if (context && context.state === "suspended") {
          void context.resume().catch(() => undefined);
        }
        const level = getAudioBusLevel();
        const gain = frameWindow?.libmidi?._midiPlayer?.gainNode;
        if (gain) {
          gain.gain.value = level;
        }
        frameWindow?.document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((element) => {
          element.volume = level;
          if (element.paused && element.autoplay) {
            void element.play().catch(() => undefined);
          }
        });
      } catch {
        // frame is navigating or cross-origin
      }
    };
    const audioTimer = window.setInterval(syncAudio, 500);
    const gestureEvents = ["pointerdown", "keydown", "touchend"] as const;
    gestureEvents.forEach((name) => window.addEventListener(name, syncAudio, true));

    frame.addEventListener("load", () => {
      setPlayerStatus("live");
      setNotice(`${selectedGame.title} booted`);
      frame.focus();
      syncAudio();
    });
    frame.src = `/freej2me/run.html?jar=${encodeURIComponent(fileName)}`;
    mount.replaceChildren(frame);
    queueMicrotask(() => setPlayerStatus("loading java runtime"));

    return () => {
      window.clearInterval(audioTimer);
      gestureEvents.forEach((name) => window.removeEventListener(name, syncAudio, true));
      frame.src = "about:blank";
      mount.replaceChildren();
    };
  }, [mountRef, reloadToken, selectedGame, setNotice]);

  return { j2meReady: true, playerStatus };
}
