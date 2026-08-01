import type { Game, GameMode } from "../../_lib/types";

type GameLibraryProps = {
  filteredGames: Game[];
  gameCount: number;
  mode: GameMode;
  query: string;
  selectedGame?: Game;
  selectGame: (file: string) => void;
  setQuery: (query: string) => void;
};

export function GameLibrary({ filteredGames, gameCount, mode, query, selectedGame, selectGame, setQuery }: GameLibraryProps) {
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
        {filteredGames.map((game, index) => (
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
        ))}
      </div>
    </aside>
  );
}
