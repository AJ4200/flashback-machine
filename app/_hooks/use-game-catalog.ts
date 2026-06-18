"use client";

import { useEffect, useMemo, useState } from "react";
import { FLAVORS, LAST_GAME_KEY } from "../_lib/constants";
import { formatBytes, titleFor } from "../_lib/games";
import type { Game } from "../_lib/types";

type UseGameCatalogOptions = {
  onCatalogError: () => void;
};

export function useGameCatalog({ onCatalogError }: UseGameCatalogOptions) {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [query, setQuery] = useState("");

  const selectedGame = useMemo(() => games.find((game) => game.file === selectedFile) ?? games[0], [games, selectedFile]);

  const filteredGames = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return games;
    }

    return games.filter((game) => `${game.title} ${game.flavor}`.toLowerCase().includes(needle));
  }, [games, query]);

  useEffect(() => {
    let cancelled = false;

    fetch("/games/flashlist.json")
      .then((response) => response.json())
      .then((files: string[]) =>
        Promise.all(
          files.map(async (file, index) => {
            const head = await fetch(`/games/${encodeURIComponent(file)}`, { method: "HEAD" }).catch(() => null);

            return {
              file,
              title: titleFor(file),
              path: `/games/${encodeURIComponent(file)}`,
              flavor: FLAVORS[index % FLAVORS.length],
              size: formatBytes(Number(head?.headers.get("content-length"))),
            };
          }),
        ),
      )
      .then((loadedGames) => {
        if (cancelled) {
          return;
        }

        const lastGame = window.localStorage.getItem(LAST_GAME_KEY);
        const chosen = loadedGames.find((game) => game.file === lastGame) ?? loadedGames[0];

        setGames(loadedGames);
        setSelectedFile(chosen?.file ?? "");
      })
      .catch(() => {
        onCatalogError();
      });

    return () => {
      cancelled = true;
    };
  }, [onCatalogError]);

  const selectGame = (file: string) => {
    setSelectedFile(file);
  };

  return {
    filteredGames,
    games,
    query,
    selectedGame,
    selectGame,
    setQuery,
  };
}
