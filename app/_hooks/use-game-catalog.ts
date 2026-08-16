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
  const [unsupportedFiles, setUnsupportedFiles] = useState<string[]>([]);
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

    const loadCatalog = async () => {
      try {
        const response = await fetch(gameCatalogPath(mode));
        const files = (await response.json()) as string[];

        const supported = files.filter((file) => isSupportedGameFile(mode, file));
        const unsupported = files.filter((file) => !isSupportedGameFile(mode, file));
        setTotalFiles(files.length);
        setUnsupportedFiles(unsupported);

        setSupportedCount(supported.length);

        const loadedGames = await Promise.all(
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

        if (!cancelled) {
          setGames(loadedGames);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          onCatalogError();
          setLoading(false);
        }
      }
    };

    void loadCatalog();

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
    unsupportedFiles,
    query,
    selectedGame,
    selectGame,
    setQuery,
  };
}
