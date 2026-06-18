"use client";

import { useEffect, useRef, useState } from "react";
import { PWA_GAME_CACHE, PWA_RUNTIME_CACHE } from "../_lib/constants";
import type { BeforeInstallPromptEvent, Game } from "../_lib/types";

export function usePwa(games: Game[], selectedGame?: Game) {
  const [pwaStatus, setPwaStatus] = useState("offline core standby");
  const [canInstall, setCanInstall] = useState(false);
  const [cacheBusy, setCacheBusy] = useState(false);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      installPromptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
      setPwaStatus("install prompt ready");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (!("serviceWorker" in navigator)) {
      setPwaStatus("pwa unsupported");

      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async (registration) => {
        setPwaStatus("offline core armed");
        await navigator.serviceWorker.ready;

        const resources = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.startsWith(window.location.origin))
          .map((url) => new URL(url).pathname);
        const urls = Array.from(new Set(["/", "/manifest.webmanifest", "/games/flashlist.json", "/ruffle/ruffle.js", ...resources]));

        if ("caches" in window) {
          const cache = await caches.open(PWA_RUNTIME_CACHE);
          await Promise.all(urls.map((url) => cache.add(url).catch(() => undefined)));
        }

        registration.active?.postMessage({ type: "CACHE_URLS", urls });
      })
      .catch(() => {
        setPwaStatus("offline worker blocked");
      });

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const installPwa = async () => {
    const prompt = installPromptRef.current;

    if (!prompt) {
      setPwaStatus("use browser install menu");
      return;
    }

    await prompt.prompt();
    const choice = await prompt.userChoice;

    setCanInstall(false);
    installPromptRef.current = null;
    setPwaStatus(choice.outcome === "accepted" ? "installed" : "install dismissed");
  };

  const cacheSelectedGame = async () => {
    if (!selectedGame || !("caches" in window)) {
      setPwaStatus("cache unavailable");
      return;
    }

    setCacheBusy(true);
    setPwaStatus("caching cartridge");

    try {
      const cache = await caches.open(PWA_GAME_CACHE);
      await cache.add(selectedGame.path);
      setPwaStatus(`${selectedGame.title} offline`);
    } catch {
      setPwaStatus("cartridge cache failed");
    } finally {
      setCacheBusy(false);
    }
  };

  const cacheLibrary = async () => {
    if (!("caches" in window)) {
      setPwaStatus("cache unavailable");
      return;
    }

    setCacheBusy(true);

    try {
      const cache = await caches.open(PWA_GAME_CACHE);
      const response = await fetch("/games/flashlist.json");
      const files = (await response.json()) as string[];

      for (let index = 0; index < files.length; index += 1) {
        setPwaStatus(`caching ${index + 1}/${files.length}`);
        await cache.add(`/games/${encodeURIComponent(files[index])}`).catch(() => undefined);
      }

      setPwaStatus("library offline");
    } catch {
      setPwaStatus("library cache failed");
    } finally {
      setCacheBusy(false);
    }
  };

  return {
    cacheBusy,
    cacheLibrary,
    cacheSelectedGame,
    canInstall,
    installPwa,
    pwaStatus,
  };
}
