"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioControls } from "../../_hooks/use-audio-controls";
import { useBootSequence } from "../../_hooks/use-boot-sequence";
import { useGbaPlayer } from "../../_hooks/use-gba-player";
import { useGameCatalog } from "../../_hooks/use-game-catalog";
import { useJ2mePlayer } from "../../_hooks/use-j2me-player";
import { usePs1Player } from "../../_hooks/use-ps1-player";
import { useJsDosPlayer } from "../../_hooks/use-js-dos-player";
import { useMamePlayer } from "../../_hooks/use-mame-player";
import { useNesPlayer } from "../../_hooks/use-nes-player";
import { usePs2Player } from "../../_hooks/use-ps2-player";
import { usePcEnginePlayer } from "../../_hooks/use-pc-engine-player";
import { usePwa } from "../../_hooks/use-pwa";
import { useRufflePlayer } from "../../_hooks/use-ruffle-player";
import { useSaveSlots } from "../../_hooks/use-save-slots";
import { useSegaPlayer } from "../../_hooks/use-sega-player";
import { detectGameMode, formatBytes, isSupportedGameFile, titleFor } from "../../_lib/games";
import { OFFLINE_PROMPT_DISMISSED_KEY } from "../../_lib/constants";
import type { Game, GameMode } from "../../_lib/types";
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
  const [localGame, setLocalGame] = useState<Game>();
  const activityIdRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const reloadGame = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const onCatalogError = useCallback(() => {
    setNotice("game catalog missing");
  }, []);

  const { filteredGames, games, loading, totalFiles, supportedCount, unsupportedFiles, query, selectedGame: catalogSelectedGame, selectGame, setQuery } = useGameCatalog({ mode, onCatalogError });
  const selectedGame = localGame?.mode === mode ? localGame : catalogSelectedGame;
  const playerGame = selectedGame?.mode === mode ? selectedGame : undefined;
  const { bootProgress, bootReady, bootStarted, startBoot } = useBootSequence();
  const { effectiveVolume, muted, setVolume, toggleMuted, volume } = useAudioControls();
  const { playerStatus: gbaPlayerStatus, ready: gbaReady } = useGbaPlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: flashPlayerStatus, ruffleReady, setPlayerStatus: setFlashPlayerStatus, setRuffleReady } = useRufflePlayer({
    effectiveVolume,
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { dosReady, playerStatus: dosPlayerStatus, setPlayerStatus: setDosPlayerStatus } = useJsDosPlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: mamePlayerStatus, mameReady } = useMamePlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: nesPlayerStatus, nesReady } = useNesPlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: ps2PlayerStatus, ready: ps2Ready } = usePs2Player({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: segaPlayerStatus, segaReady } = useSegaPlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: pcEnginePlayerStatus, ready: pcEngineReady } = usePcEnginePlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { playerStatus: ps1PlayerStatus, ps1Ready } = usePs1Player({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
    setNotice,
  });
  const { j2meReady, playerStatus: j2mePlayerStatus } = useJ2mePlayer({
    mountRef,
    reloadToken,
    selectedGame: playerGame,
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
      : mode === "ps1"
      ? ps1PlayerStatus
      : mode === "j2me"
      ? j2mePlayerStatus
      : mode === "sega"
      ? segaPlayerStatus
      : pcEnginePlayerStatus;
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
      : mode === "ps1"
      ? ps1Ready
      : mode === "j2me"
      ? j2meReady
      : mode === "sega"
      ? segaReady
      : pcEngineReady;
  const bootLines = [
    `FLASH / RUFFLE: ${ruffleReady ? "READY" : /error|blocked|failed/i.test(flashPlayerStatus) ? "ERROR" : "LOADING"}`,
    `DOS / JS-DOS: ${dosReady ? "READY" : /error|blocked|failed/i.test(dosPlayerStatus) ? "ERROR" : "LOADING"}`,
    "RETROARCH NES / MAME / SEGA / PS1 / J2ME / PC ENGINE / GAME BOY: LOAD ON SELECT",
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

  useEffect(
    () => () => {
      if (localGame?.path.startsWith("blob:")) {
        URL.revokeObjectURL(localGame.path);
      }
    },
    [localGame],
  );

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
    setLocalGame(undefined);
    selectGame(file);
    reloadGame();
  };

  const loadLocalGame = (file: File) => {
    const targetMode = detectGameMode(file.name, mode, file.size);
    if (!targetMode) {
      setNotice(`${file.name} is not a supported game file`);
      return;
    }

    const path = URL.createObjectURL(file);
    setLocalGame({
      file: file.name,
      title: titleFor(file.name, targetMode),
      path,
      flavor: "LOCAL FILE",
      mode: targetMode,
      size: formatBytes(file.size),
    });
    if (targetMode !== mode) {
      setMode(targetMode);
    }
    selectGame("");
    reloadGame();
    setNotice(`${file.name} loaded from your device (${targetMode.toUpperCase()} core)`);
  };

  const switchMode = (nextMode: GameMode) => {
    setLocalGame(undefined);
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
            isLocalGame={Boolean(selectedGame && localGame === selectedGame)}
            loadSlot={loadSlot}
            localRomName={localGame?.mode === mode ? localGame.file : undefined}
            mode={mode}
            mountRef={mountRef}
            muted={muted}
            notice={notice}
            onLoadLocalFile={loadLocalGame}
            onToggleMuted={toggleMuted}
            onVolumeChange={setVolume}
            pwaStatus={pwaStatus}
            saveSlot={saveSlot}
            saveSlots={saveSlots}
            selectedGame={selectedGame}
            stageRef={stageRef}
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
