"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioControls } from "../../_hooks/use-audio-controls";
import { useBootSequence } from "../../_hooks/use-boot-sequence";
import { useGameCatalog } from "../../_hooks/use-game-catalog";
import { useJsDosPlayer } from "../../_hooks/use-js-dos-player";
import { useMamePlayer } from "../../_hooks/use-mame-player";
import { useNesPlayer } from "../../_hooks/use-nes-player";
import { usePwa } from "../../_hooks/use-pwa";
import { useRufflePlayer } from "../../_hooks/use-ruffle-player";
import { useSaveSlots } from "../../_hooks/use-save-slots";
import { OFFLINE_PROMPT_DISMISSED_KEY } from "../../_lib/constants";
import type { GameMode } from "../../_lib/types";
import { BootOverlay } from "./boot-overlay";
import { Cabinet } from "./cabinet";
import { GameLibrary } from "./game-library";
import { LoveBadge } from "./love-badge";
import { Marquee } from "./marquee";
import { MemoryPanel } from "./memory-panel";
import { OfflinePrompt } from "./offline-prompt";

export function FlashBackMachineArcade() {
  const [notice, setNotice] = useState("memory card ready");
  const [offlinePromptDismissed, setOfflinePromptDismissed] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [mode, setMode] = useState<GameMode>("flash");
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const reloadGame = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const onCatalogError = useCallback(() => {
    setNotice("game catalog missing");
  }, []);

  const { filteredGames, games, loading, totalFiles, supportedCount, query, selectedGame, selectGame, setQuery } = useGameCatalog({ mode, onCatalogError });
  const { bootProgress, bootReady, bootStarted, startBoot } = useBootSequence();
  const { effectiveVolume, muted, setVolume, toggleMuted, volume } = useAudioControls();
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
  const { cacheBusy, cacheLibrary, cacheSelectedGame, canInstall, installPwa, pwaStatus } = usePwa(games, selectedGame, mode);
  const { clearSlot, loadSlot, saveSlot, saveSlots } = useSaveSlots({
    onReload: reloadGame,
    selectedGame,
    setNotice,
  });

  useEffect(() => {
    setOfflinePromptDismissed(window.localStorage.getItem(OFFLINE_PROMPT_DISMISSED_KEY) === "true");
  }, []);

  const selectGameAndReload = (file: string) => {
    selectGame(file);
    reloadGame();
  };

  const switchMode = (nextMode: GameMode) => {
    setMode(nextMode);
    setNotice(`${nextMode === "flash" ? "flash" : nextMode} deck armed`);
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
          playerStatus={
            mode === "flash"
              ? flashPlayerStatus
              : mode === "jsdos"
              ? dosPlayerStatus
              : mode === "mame"
              ? mamePlayerStatus
              : nesPlayerStatus
          }
          ruffleReady={
            mode === "flash"
              ? ruffleReady
              : mode === "jsdos"
              ? dosReady
              : mode === "mame"
              ? mameReady
              : nesReady
          }
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
          />
          <Cabinet
            gameCount={games.length}
            mode={mode}
            mountRef={mountRef}
            onFullscreen={enterFullscreen}
            onReload={reloadGame}
            selectedGame={selectedGame}
            stageRef={stageRef}
          />
          <MemoryPanel
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

      <BootOverlay bootProgress={bootProgress} bootReady={bootReady} bootStarted={bootStarted} onStart={startBoot} />
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
