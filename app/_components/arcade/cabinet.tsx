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
  return (
    <section className="cabinet">
      <div className="screen-bezel" ref={stageRef}>
        <div className="screen-topline">
          <span>{selectedGame?.title ?? "choose your game"}</span>
          <span>{selectedGame?.size ?? `${gameCount.toString().padStart(2, "0")} games`}</span>
        </div>
        <div className={`screen ${mode === "jsdos" ? "screen-dos" : "screen-flash"}`} ref={mountRef}>
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
                <span>{mode === "flash" ? "select game" : "boot dos title"}</span>
              </div>
            </div>
          ) : (
            <div className="screen-standby">
              <span>{mode === "flash" ? "INSERT CARTRIDGE" : "LOAD DOS BUNDLE"}</span>
            </div>
          )}
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
            {mode === "flash" ? "download swf" : "download bundle"}
          </a>
        </div>
      ) : null}
    </section>
  );
}
