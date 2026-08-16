import type { GameMode } from "./types";

export const FLASH_CATALOG_PATH = "/games/flash/flashlist.json";
export const JSDOS_CATALOG_PATH = "/games/jsdos/jsdoslist.json";
export const MAME_CATALOG_PATH = "/games/mame/mamelist.json";
export const NES_CATALOG_PATH = "/games/nes/neslist.json";
export const SEGA_CATALOG_PATH = "/games/sega/segalist.json";

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
    case "sega":
      return SEGA_CATALOG_PATH;
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
      return [/\.nes$/i, /\.fds$/i, /\.unf$/i, /\.unif$/i];
    case "sega":
      return [/\.md$/i, /\.gen$/i, /\.smd$/i, /\.bin$/i, /\.sms$/i, /\.gg$/i, /\.sg$/i, /\.cue$/i, /\.iso$/i, /\.chd$/i];
  }
};

export const isSupportedGameFile = (mode: GameMode, file: string) =>
  supportedGameExtensions(mode).some((pattern) => pattern.test(file));

export const slugFor = (value: string) =>
  value
    .replace(/\.(swf|jsdos|zip|7z|nes|fds|unf|unif|md|gen|smd|bin|sms|gg|sg|cue|iso|chd)$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const titleFor = (file: string, mode: GameMode) => {
  const extension =
    mode === "flash"
      ? /\.swf$/i
      : mode === "jsdos"
      ? /\.jsdos$/i
      : mode === "mame"
      ? /\.(zip|7z|chd)$/i
      : mode === "sega"
      ? /\.(md|gen|smd|bin|sms|gg|sg|cue|iso|chd)$/i
      : /\.(nes|fds|unf|unif)$/i;

  return file.replace(extension, "");
};

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
