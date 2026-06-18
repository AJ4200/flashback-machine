import type { RefObject } from "react";
import type { Game } from "../../_lib/types";

type CabinetProps = {
  gameCount: number;
  mountRef: RefObject<HTMLDivElement | null>;
  onFullscreen: () => void;
  onReload: () => void;
  selectedGame?: Game;
  stageRef: RefObject<HTMLDivElement | null>;
};

export function Cabinet({ gameCount, mountRef, onFullscreen, onReload, selectedGame, stageRef }: CabinetProps) {
  return (
    <section className="cabinet">
      <div className="screen-bezel" ref={stageRef}>
        <div className="screen-topline">
          <span>{selectedGame?.title ?? "choose your game"}</span>
          <span>{selectedGame?.size ?? `${gameCount.toString().padStart(2, "0")} games`}</span>
        </div>
        <div className="screen" ref={mountRef}>
          {!selectedGame ? (
            <div className="screen-standby screen-welcome">
              <span>no game loaded</span>
              <small>{gameCount > 0 ? `${gameCount} games online - choose a cabinet from the wall` : "scanning library"}</small>
            </div>
          ) : (
            <div className="screen-standby">
              <span>INSERT CARTRIDGE</span>
            </div>
          )}
        </div>
      </div>

      <div className="control-deck">
        <button className="arcade-button hot" onClick={onFullscreen} type="button">
          full screen
        </button>
        <button className="arcade-button" disabled={!selectedGame} onClick={onReload} type="button">
          reload
        </button>
        {selectedGame ? (
          <a className="arcade-button cyan" download={selectedGame.file} href={selectedGame.path}>
            download swf
          </a>
        ) : (
          <span className="arcade-button is-disabled">download swf</span>
        )}
      </div>
    </section>
  );
}
