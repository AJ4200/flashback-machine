"use client";

import { useEffect, useMemo, useState } from "react";
import { FLAVORS } from "../_lib/constants";
import { FLASH_CATALOG_PATH, flashGamePath, formatBytes, titleFor } from "../_lib/games";
import type { Game } from "../_lib/types";

type UseGameCatalogOptions = {
  onCatalogError: () => void;
};

export function useGameCatalog({ onCatalogError }: UseGameCatalogOptions) {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [query, setQuery] = useState("");

  const selectedGame = useMemo(() => games.find((game) => game.file === selectedFile), [games, selectedFile]);

  const filteredGames = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return games;
    }

    return games.filter((game) => `${game.title} ${game.flavor}`.toLowerCase().includes(needle));
  }, [games, query]);

  useEffect(() => {
    let cancelled = false;

    fetch(FLASH_CATALOG_PATH)
      .then((response) => response.json())
      .then((files: string[]) =>
        Promise.all(
          files.map(async (file, index) => {
            const head = await fetch(flashGamePath(file), { method: "HEAD" }).catch(() => null);

            return {
              file,
              title: titleFor(file),
              path: flashGamePath(file),
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

        setGames(loadedGames);
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
