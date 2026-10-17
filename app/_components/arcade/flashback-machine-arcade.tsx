"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioControls } from "../../_hooks/use-audio-controls";
import { useBootSequence } from "../../_hooks/use-boot-sequence";
import { useGbaPlayer } from "../../_hooks/use-gba-player";
import { useGameCatalog } from "../../_hooks/use-game-catalog";
import { useJsDosPlayer } from "../../_hooks/use-js-dos-player";
import { useMamePlayer } from "../../_hooks/use-mame-player";
import { useNesPlayer } from "../../_hooks/use-nes-player";
import { usePs2Player } from "../../_hooks/use-ps2-player";
import { usePwa } from "../../_hooks/use-pwa";
import { useRufflePlayer } from "../../_hooks/use-ruffle-player";
import { useSaveSlots } from "../../_hooks/use-save-slots";
import { useSegaPlayer } from "../../_hooks/use-sega-player";
import { OFFLINE_PROMPT_DISMISSED_KEY } from "../../_lib/constants";
import type { GameMode } from "../../_lib/types";
import { BootOverlay } from "./boot-overlay";
import { Cabinet } from "./cabinet";
import { GameLibrary } from "./game-library";
import { LoveBadge } from "./love-badge";
import { Marquee } from "./marquee";
import { MemoryPanel, type ActivityLine } from "./memory-panel";
import { OfflinePrompt } from "./offline-prompt";

export function FlashBackMachineArcade() {
  const [notice, setNotice] = useState("memory card ready");
  const [offlinePromptDismissed, setOfflinePromptDismissed] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [mode, setMode] = useState<GameMode>("flash");
  const [activityLines, setActivityLines] = useState<ActivityLine[]>([]);
  const activityIdRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const reloadGame = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const onCatalogError = useCallback(() => {
    setNotice("game catalog missing");
  }, []);

  const { filteredGames, games, loading, totalFiles, supportedCount, unsupportedFiles, query, selectedGame, selectGame, setQuery } = useGameCatalog({ mode, onCatalogError });
  const { bootProgress, bootReady, bootStarted, startBoot } = useBootSequence();
  const { effectiveVolume, muted, setVolume, toggleMuted, volume } = useAudioControls();
  const { playerStatus: gbaPlayerStatus, ready: gbaReady } = useGbaPlayer({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { playerStatus: flashPlayerStatus, ruffleReady, setPlayerStatus: setFlashPlayerStatus, setRuffleReady } = useRufflePlayer({
    effectiveVolume,
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { dosReady, playerStatus: dosPlayerStatus, setPlayerStatus: setDosPlayerStatus } = useJsDosPlayer({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { playerStatus: mamePlayerStatus, mameReady } = useMamePlayer({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { playerStatus: nesPlayerStatus, nesReady } = useNesPlayer({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { playerStatus: ps2PlayerStatus, ready: ps2Ready } = usePs2Player({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { playerStatus: segaPlayerStatus, segaReady } = useSegaPlayer({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { cacheBusy, cacheLibrary, cacheSelectedGame, canInstall, installPwa, pwaStatus } = usePwa(games, selectedGame, mode);
  const { clearSlot, loadSlot, saveSlot, saveSlots } = useSaveSlots({
    onReload: reloadGame,
    selectedGame,
    setNotice,
  });
  const activePlayerStatus =
    mode === "flash"
      ? flashPlayerStatus
      : mode === "gba"
      ? gbaPlayerStatus
      : mode === "jsdos"
      ? dosPlayerStatus
      : mode === "mame"
      ? mamePlayerStatus
      : mode === "nes"
      ? nesPlayerStatus
      : mode === "ps2"
      ? ps2PlayerStatus
      : segaPlayerStatus;
  const activeRuntimeReady =
    mode === "flash"
      ? ruffleReady
      : mode === "gba"
      ? gbaReady
      : mode === "jsdos"
      ? dosReady
      : mode === "mame"
      ? mameReady
      : mode === "nes"
      ? nesReady
      : mode === "ps2"
      ? ps2Ready
      : segaReady;
  const bootLines = [
    `FLASH / RUFFLE: ${ruffleReady ? "READY" : /error|blocked|failed/i.test(flashPlayerStatus) ? "ERROR" : "LOADING"}`,
    `DOS / JS-DOS: ${dosReady ? "READY" : /error|blocked|failed/i.test(dosPlayerStatus) ? "ERROR" : "LOADING"}`,
    "RETROARCH NES / MAME / SEGA / GAME BOY: LOAD ON SELECT",
    "PLAY! PLAYSTATION 2: LOAD ON SELECT",
    "KEYBOARD + USB / BLUETOOTH GAMEPAD: PER-SYSTEM MAPPINGS",
  ];

  const appendActivity = useCallback((message: string, level: ActivityLine["level"] = "info") => {
    const time = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    setActivityLines((lines) => {
      if (lines[lines.length - 1]?.message === message) {
        return lines;
      }

      return [...lines.slice(-39), { id: activityIdRef.current++, time, message, level }];
    });
  }, []);

  useEffect(() => {
    setOfflinePromptDismissed(window.localStorage.getItem(OFFLINE_PROMPT_DISMISSED_KEY) === "true");
  }, []);

  useEffect(() => {
    appendActivity(`${mode.toUpperCase()} emulator selected`);
  }, [appendActivity, mode]);

  useEffect(() => {
    if (loading) {
      appendActivity(`Scanning ${mode.toUpperCase()} game catalog`);
    } else {
      appendActivity(`${mode.toUpperCase()} catalog ready (${games.length} games)`);
    }
  }, [appendActivity, games.length, loading, mode]);

  useEffect(() => {
    if (selectedGame) {
      appendActivity(`Selected game: ${selectedGame.title}`);
    }
  }, [appendActivity, selectedGame]);

  useEffect(() => {
    if (selectedGame && activePlayerStatus !== "waiting for game") {
      appendActivity(
        `${mode.toUpperCase()} core: ${activePlayerStatus}`,
        /error|failed|unavailable|blocked/i.test(activePlayerStatus) ? "error" : "info",
      );
    }
  }, [activePlayerStatus, appendActivity, mode, selectedGame]);

  useEffect(() => {
    if (notice !== "memory card ready") {
      appendActivity(notice, /error|failed|missing|could not/i.test(notice) ? "error" : "info");
    }
  }, [appendActivity, notice]);

  const selectGameAndReload = (file: string) => {
    selectGame(file);
    reloadGame();
  };

  const switchMode = (nextMode: GameMode) => {
    setMode(nextMode);
    setNotice(`${nextMode.toUpperCase()} deck armed`);
  };

  const enterFullscreen = () => {
    stageRef.current?.requestFullscreen?.();
  };

  const dismissOfflinePrompt = () => {
    window.localStorage.setItem(OFFLINE_PROMPT_DISMISSED_KEY, "true");
    setOfflinePromptDismissed(true);
  };

  return (
    <>
      <Script
        src="/ruffle/ruffle.js"
        strategy="afterInteractive"
        onLoad={() => setRuffleReady(true)}
        onError={() => {
          setRuffleReady(false);
          setFlashPlayerStatus("ruffle network error");
          setNotice("ruffle runtime could not load");
        }}
      />

      <main className="arcade-shell">
        <div className="crt-noise" aria-hidden="true" />
        <Marquee
          mode={mode}
          playerStatus={activePlayerStatus}
          ruffleReady={activeRuntimeReady}
        />

        <section className="arcade-grid">
          <GameLibrary
            filteredGames={filteredGames}
            gameCount={games.length}
            mode={mode}
            query={query}
            selectedGame={selectedGame}
            selectGame={selectGameAndReload}
            setQuery={setQuery}
            isLoading={loading}
            totalFiles={totalFiles}
            supportedCount={supportedCount}
            unsupportedFiles={unsupportedFiles}
          />
          <Cabinet
            gameCount={games.length}
            mode={mode}
            mountRef={mountRef}
            onFullscreen={enterFullscreen}
            onReload={reloadGame}
            playerStatus={activePlayerStatus}
            selectedGame={selectedGame}
            stageRef={stageRef}
          />
          <MemoryPanel
            activityLines={activityLines}
            cacheBusy={cacheBusy}
            cacheLibrary={cacheLibrary}
            cacheSelectedGame={cacheSelectedGame}
            canInstall={canInstall}
            clearSlot={clearSlot}
            gameCount={games.length}
            installPwa={installPwa}
            loadSlot={loadSlot}
            mode={mode}
            muted={muted}
            notice={notice}
            onToggleMuted={toggleMuted}
            onVolumeChange={setVolume}
            pwaStatus={pwaStatus}
            saveSlot={saveSlot}
            saveSlots={saveSlots}
            selectedGame={selectedGame}
            switchMode={switchMode}
            volume={volume}
          />
        </section>

        <LoveBadge />
      </main>

      <BootOverlay bootLines={bootLines} bootProgress={bootProgress} bootReady={bootReady} bootStarted={bootStarted} onStart={startBoot} />
      <OfflinePrompt
        cacheBusy={cacheBusy}
        canInstall={canInstall}
        gameCount={games.length}
        onCacheLibrary={cacheLibrary}
        onDismiss={dismissOfflinePrompt}
        onInstall={installPwa}
        visible={bootStarted && !offlinePromptDismissed}
      />
    </>
  );
}
