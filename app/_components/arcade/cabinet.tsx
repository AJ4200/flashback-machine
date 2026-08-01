import type { RefObject } from "react";
import type { Game, GameMode } from "../../_lib/types";

type CabinetProps = {
  gameCount: number;
  mode: GameMode;
  mountRef: RefObject<HTMLDivElement | null>;
  onFullscreen: () => void;
  onReload: () => void;
  selectedGame?: Game;
  stageRef: RefObject<HTMLDivElement | null>;
};

export function Cabinet({ gameCount, mode, mountRef, onFullscreen, onReload, selectedGame, stageRef }: CabinetProps) {
  const engineName = mode === "flash" ? "Flash" : mode === "jsdos" ? "DOS" : mode.toUpperCase();

  return (
    <section className="cabinet">
      <div className="screen-bezel" ref={stageRef}>
        <div className="screen-topline">
          <span>{selectedGame?.title ?? "choose your game"}</span>
          <span>{selectedGame?.size ?? `${gameCount.toString().padStart(2, "0")} games`}</span>
        </div>
        <div className={`screen ${mode === "jsdos" ? "screen-dos" : "screen-flash"}`}>
          <div className="screen-content" ref={mountRef}>
            {!selectedGame ? (
              <div className="screen-welcome">
                <img src="/icons/flashback-machine-192.png" alt="" width="92" height="92" />
                <div className="welcome-copy">
                  <span>no game loaded</span>
                  <strong>{gameCount > 0 ? `${gameCount} games online` : "scanning library"}</strong>
                  <small>choose a cabinet from the wall to start playing</small>
                </div>
                <div className="welcome-prompt">
                  <span>ready</span>
                  <span>{mode === "flash" ? "select game" : `boot ${engineName} title`}</span>
                </div>
              </div>
            ) : (
              <div className="screen-standby">
                <span>{mode === "flash" ? "INSERT CARTRIDGE" : `LOAD ${engineName} ROM`}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedGame ? (
        <div className="control-deck">
          <button className="arcade-button hot" onClick={onFullscreen} type="button">
            full screen
          </button>
          <button className="arcade-button" onClick={onReload} type="button">
            reload
          </button>
          <a className="arcade-button cyan" download={selectedGame.file} href={selectedGame.path}>
            {mode === "flash" ? "download swf" : `download ${mode} rom`}
          </a>
        </div>
      ) : null}
    </section>
  );
}
