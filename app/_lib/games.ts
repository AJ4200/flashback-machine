import type { GameMode } from "./types";

export const FLASH_CATALOG_PATH = "/games/flash/flashlist.json";
export const JSDOS_CATALOG_PATH = "/games/jsdos/jsdoslist.json";

export const gameCatalogPath = (mode: GameMode) => (mode === "flash" ? FLASH_CATALOG_PATH : JSDOS_CATALOG_PATH);

export const gameAssetPath = (mode: GameMode, file: string) =>
  mode === "flash" ? `/games/flash/${encodeURIComponent(file)}` : `/games/jsdos/${encodeURIComponent(file)}`;

export const slugFor = (value: string) =>
  value
    .replace(/\.(swf|jsdos)$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const titleFor = (file: string, mode: GameMode) => file.replace(mode === "flash" ? /\.swf$/i : /\.jsdos$/i, "");

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
