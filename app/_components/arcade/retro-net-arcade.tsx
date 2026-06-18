"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { useBootSequence } from "../../_hooks/use-boot-sequence";
import { useGameCatalog } from "../../_hooks/use-game-catalog";
import { usePwa } from "../../_hooks/use-pwa";
import { useRufflePlayer } from "../../_hooks/use-ruffle-player";
import { useSaveSlots } from "../../_hooks/use-save-slots";
import { BootOverlay } from "./boot-overlay";
import { Cabinet } from "./cabinet";
import { GameLibrary } from "./game-library";
import { LoveBadge } from "./love-badge";
import { Marquee } from "./marquee";
import { MemoryPanel } from "./memory-panel";

export function RetroNetArcade() {
  const [notice, setNotice] = useState("memory card ready");
  const [reloadToken, setReloadToken] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const reloadGame = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const onCatalogError = useCallback(() => {
    setNotice("game catalog missing");
  }, []);

  const { filteredGames, games, query, selectedGame, selectGame, setQuery } = useGameCatalog({ onCatalogError });
  const { bootProgress, bootReady, bootStarted, startBoot } = useBootSequence();
  const { playerStatus, ruffleReady, setPlayerStatus, setRuffleReady } = useRufflePlayer({
    mountRef,
    reloadToken,
    selectedGame,
    setNotice,
  });
  const { cacheBusy, cacheLibrary, cacheSelectedGame, canInstall, installPwa, pwaStatus } = usePwa(games, selectedGame);
  const { clearSlot, loadSlot, saveSlot, saveSlots } = useSaveSlots({
    onReload: reloadGame,
    selectedGame,
    setNotice,
  });

  const selectGameAndReload = (file: string) => {
    selectGame(file);
    reloadGame();
  };

  const enterFullscreen = () => {
    stageRef.current?.requestFullscreen?.();
  };

  return (
    <>
      <Script
        src="/ruffle/ruffle.js"
        strategy="afterInteractive"
        onLoad={() => setRuffleReady(true)}
        onError={() => {
          setRuffleReady(false);
          setPlayerStatus("ruffle network error");
          setNotice("ruffle runtime could not load");
        }}
      />

      <main className="arcade-shell">
        <div className="crt-noise" aria-hidden="true" />
        <Marquee playerStatus={playerStatus} ruffleReady={ruffleReady} />

        <section className="arcade-grid">
          <GameLibrary
            filteredGames={filteredGames}
            gameCount={games.length}
            query={query}
            selectedGame={selectedGame}
            selectGame={selectGameAndReload}
            setQuery={setQuery}
          />
          <Cabinet
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
            notice={notice}
            pwaStatus={pwaStatus}
            saveSlot={saveSlot}
            saveSlots={saveSlots}
            selectedGame={selectedGame}
          />
        </section>

        <LoveBadge />
      </main>

      <BootOverlay bootProgress={bootProgress} bootReady={bootReady} bootStarted={bootStarted} onStart={startBoot} />
    </>
  );
}
