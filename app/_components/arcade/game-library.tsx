import type { Game, GameMode } from "../../_lib/types";
import { EmulatorSelector } from "./memory-panel";

type GameLibraryProps = {
  isLocalGame: boolean;
  localRomName?: string;
  onLoadLocalFile: (file: File) => void;
  switchMode: (mode: GameMode) => void;
  filteredGames: Game[];
  gameCount: number;
  mode: GameMode;
  query: string;
  selectedGame?: Game;
  selectGame: (file: string) => void;
  setQuery: (query: string) => void;
  isLoading: boolean;
  totalFiles?: number;
  supportedCount?: number;
  unsupportedFiles?: string[];
};

export function GameLibrary({ filteredGames, gameCount, isLocalGame, localRomName, mode, onLoadLocalFile, query, selectedGame, selectGame, setQuery, switchMode, isLoading, totalFiles, supportedCount }: GameLibraryProps) {
  const libraryName = mode === "flash" ? "Flash" : mode === "gba" ? "Game Boy" : mode === "jsdos" ? "JS DOS" : mode === "sega" ? "Sega" : mode === "pcengine" ? "PC Engine" : mode === "ps2" ? "PS2" : mode === "ps1" ? "PS1" : mode === "j2me" ? "Java" : mode.toUpperCase();
  const searchPlaceholder = mode === "flash" ? "game title" : `${libraryName} title`;

  return (
    <aside className="library-panel" aria-label={`${libraryName} game library`}>
      <div className="panel-header">
        <span>cabinet wall</span>
        <strong>{gameCount.toString().padStart(2, "0")}</strong>
      </div>

      <EmulatorSelector isLocalGame={isLocalGame} localRomName={localRomName} mode={mode} onLoadLocalFile={onLoadLocalFile} switchMode={switchMode} />

      <label className="search-box">
        <span>find</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} type="search" />
      </label>

      <div className="game-list">
        {isLoading ? (
          <div className="game-list-empty">
            <span className="spinner" aria-hidden="true" />
            <strong>loading {mode.toUpperCase()} library</strong>
            <small>tuning cabinet rails and fetching ROMs</small>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="game-list-empty">
            <strong>{query ? `no ${mode.toUpperCase()} games matched` : "no games loaded locally"}</strong>
            <small>
              {query ? (
                `clear the search or try another title`
              ) : mode === "mame" && typeof totalFiles === "number" && totalFiles > 0 && supportedCount === 0 ? (
                "The catalog contains files, but none are supported (.zip, .7z, .chd). Check mamelist.json or file extensions."
              ) : (
                `Use "load local file" above to play a file from your device, or add games to public/games/${mode} and list them in the catalog.`
              )}
            </small>
          </div>
        ) : (
          filteredGames.map((game, index) => (
            <button
              className={`game-tile ${game.file === selectedGame?.file ? "is-active" : ""}`}
              key={game.file}
              onClick={() => selectGame(game.file)}
              type="button"
            >
              <span className="game-rank">{(index + 1).toString().padStart(2, "0")}</span>
              <span>
                <strong>{game.title}</strong>
                <small>{game.flavor}</small>
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
