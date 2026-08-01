import type { Game, GameMode } from "../../_lib/types";

type GameLibraryProps = {
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
};

export function GameLibrary({ filteredGames, gameCount, mode, query, selectedGame, selectGame, setQuery, isLoading, totalFiles, supportedCount }: GameLibraryProps) {
  const libraryName = mode === "flash" ? "Flash" : mode === "jsdos" ? "JS DOS" : mode.toUpperCase();
  const searchPlaceholder = mode === "flash" ? "game title" : `${mode} title`;

  return (
    <aside className="library-panel" aria-label={`${libraryName} game library`}>
      <div className="panel-header">
        <span>cabinet wall</span>
        <strong>{gameCount.toString().padStart(2, "0")}</strong>
      </div>

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
            <strong>{query ? `no ${mode.toUpperCase()} games matched` : `no ${mode.toUpperCase()} games loaded`}</strong>
            <small>
              {query ? (
                `clear the search or try another title`
              ) : mode === "mame" && typeof totalFiles === "number" && totalFiles > 0 && supportedCount === 0 ? (
                "The catalog contains files, but none are supported (.zip, .7z, .chd). Check mamelist.json or file extensions."
              ) : mode === "mame" ? (
                "Add .zip, .7z or .chd ROMs to public/games/mame and list them in mamelist.json"
              ) : mode === "nes" ? (
                "Add plain .nes ROMs to public/games/nes and list them in neslist.json"
              ) : (
                `Place valid ${mode} files into public/games/${mode} and list them in the catalog`
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
