"use client";

import { useEffect, useMemo, useState } from "react";
import { FLAVORS } from "../_lib/constants";
import { formatBytes, gameAssetPath, gameCatalogPath, titleFor, isSupportedGameFile } from "../_lib/games";
import type { Game, GameMode } from "../_lib/types";

type UseGameCatalogOptions = {
  mode: GameMode;
  onCatalogError: () => void;
};

export function useGameCatalog({ mode, onCatalogError }: UseGameCatalogOptions) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [supportedCount, setSupportedCount] = useState(0);
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
    setSelectedFile("");
    setQuery("");
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setGames([]);
    setTotalFiles(0);
    setSupportedCount(0);

    fetch(gameCatalogPath(mode))
      .then((response) => response.json())
      .then((files: string[]) => {
        const supported = files.filter((file) => isSupportedGameFile(mode, file));
        setTotalFiles(files.length);
        setSupportedCount(supported.length);

        return Promise.all(
          supported.map(async (file, index) => {
            const head = await fetch(gameAssetPath(mode, file), { method: "HEAD" }).catch(() => null);

            return {
              file,
              title: titleFor(file, mode),
              path: gameAssetPath(mode, file),
              flavor: FLAVORS[index % FLAVORS.length],
              mode,
              size: formatBytes(Number(head?.headers.get("content-length"))),
            };
          }),
        );
      })
      .then((loadedGames) => {
        if (cancelled) {
          return;
        }

        setGames(loadedGames);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          onCatalogError();
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, onCatalogError]);

  const selectGame = (file: string) => {
    setSelectedFile(file);
  };

  return {
    filteredGames,
    games,
    loading,
    totalFiles,
    supportedCount,
    query,
    selectedGame,
    selectGame,
    setQuery,
  };
}
