import type { Game } from "../../_lib/types";

type GameLibraryProps = {
  filteredGames: Game[];
  gameCount: number;
  query: string;
  selectedGame?: Game;
  selectGame: (file: string) => void;
  setQuery: (query: string) => void;
};

export function GameLibrary({ filteredGames, gameCount, query, selectedGame, selectGame, setQuery }: GameLibraryProps) {
  return (
    <aside className="library-panel" aria-label="Flash game library">
      <div className="panel-header">
        <span>cabinet wall</span>
        <strong>{gameCount.toString().padStart(2, "0")}</strong>
      </div>

      <label className="search-box">
        <span>find</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="game title" type="search" />
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
