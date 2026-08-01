import type { GameMode } from "./types";

export const FLASH_CATALOG_PATH = "/games/flash/flashlist.json";
export const JSDOS_CATALOG_PATH = "/games/jsdos/jsdoslist.json";
export const MAME_CATALOG_PATH = "/games/mame/mamelist.json";
export const NES_CATALOG_PATH = "/games/nes/neslist.json";

export const gameCatalogPath = (mode: GameMode) => {
  switch (mode) {
    case "flash":
      return FLASH_CATALOG_PATH;
    case "jsdos":
      return JSDOS_CATALOG_PATH;
    case "mame":
      return MAME_CATALOG_PATH;
    case "nes":
      return NES_CATALOG_PATH;
  }
};

export const gameAssetPath = (mode: GameMode, file: string) => {
  const folder = mode === "flash" ? "flash" : mode === "jsdos" ? "jsdos" : mode;

  return `/games/${folder}/${encodeURIComponent(file)}`;
};

export const supportedGameExtensions = (mode: GameMode) => {
  switch (mode) {
    case "flash":
      return [/\.swf$/i];
    case "jsdos":
      return [/\.jsdos$/i];
    case "mame":
      return [/\.zip$/i, /\.7z$/i, /\.chd$/i];
    case "nes":
      return [/\.nes$/i];
  }
};

export const isSupportedGameFile = (mode: GameMode, file: string) =>
  supportedGameExtensions(mode).some((pattern) => pattern.test(file));

export const slugFor = (value: string) =>
  value
    .replace(/\.(swf|jsdos|zip|7z|nes|fds|unf|unif|chd)$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const titleFor = (file: string, mode: GameMode) => {
  const extension = mode === "flash" ? /\.swf$/i : mode === "jsdos" ? /\.jsdos$/i : mode === "mame" ? /\.(zip|7z|chd)$/i : /\.(nes|fds|unf|unif)$/i;

  return file.replace(extension, "");
};

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

// List of mapper numbers implemented by jsnes (from node_modules/jsnes/src/mappers)
export const SUPPORTED_NES_MAPPERS = [
  0, 1, 2, 3, 4, 5, 7, 9, 11, 34, 38, 66, 71, 79, 94, 118, 119, 140, 180, 240, 241,
];

export const isNesMapperSupported = (mapper: number) => SUPPORTED_NES_MAPPERS.includes(mapper);
