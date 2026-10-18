import type { GameMode } from "./types";

export const FLASH_CATALOG_PATH = "/games/flash/flashlist.json";
export const GBA_CATALOG_PATH = "/games/gba/gbalist.json";
export const JSDOS_CATALOG_PATH = "/games/jsdos/jsdoslist.json";
export const MAME_CATALOG_PATH = "/games/mame/mamelist.json";
export const NES_CATALOG_PATH = "/games/nes/neslist.json";
export const PCENGINE_CATALOG_PATH = "/games/pcengine/pcenginelist.json";
export const PS2_CATALOG_PATH = "/games/ps2/ps2list.json";
export const SEGA_CATALOG_PATH = "/games/sega/segalist.json";

export const gameCatalogPath = (mode: GameMode) => {
  switch (mode) {
    case "flash":
      return FLASH_CATALOG_PATH;
    case "gba":
      return GBA_CATALOG_PATH;
    case "jsdos":
      return JSDOS_CATALOG_PATH;
    case "mame":
      return MAME_CATALOG_PATH;
    case "nes":
      return NES_CATALOG_PATH;
    case "pcengine":
      return PCENGINE_CATALOG_PATH;
    case "ps2":
      return PS2_CATALOG_PATH;
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
    case "gba":
      return [/\.(gba|gbc|gb)$/i];
    case "jsdos":
      return [/\.jsdos$/i];
    case "mame":
      return [/\.zip$/i, /\.7z$/i, /\.chd$/i];
    case "nes":
      return [/\.nes$/i, /\.fds$/i, /\.unf$/i, /\.unif$/i];
    case "pcengine":
      return [/\.pce$/i];
    case "ps2":
      return [/\.iso$/i, /\.cso$/i, /\.chd$/i, /\.isz$/i, /\.bin$/i, /\.elf$/i];
    case "sega":
      return [/\.md$/i, /\.gen$/i, /\.smd$/i, /\.bin$/i, /\.sms$/i, /\.gg$/i, /\.sg$/i, /\.cue$/i, /\.iso$/i, /\.chd$/i];
  }
};

export const isSupportedGameFile = (mode: GameMode, file: string) =>
  supportedGameExtensions(mode).some((pattern) => pattern.test(file));

export const gameFileAccept = (mode: GameMode) =>
  supportedGameExtensions(mode)
    .flatMap((pattern) =>
      pattern.source
        .replace(/^\\\./, "")
        .replace(/\$$/, "")
        .replace(/[()]/g, "")
        .split("|"),
    )
    .map((extension) => `.${extension}`)
    .join(",");

export const slugFor = (value: string) =>
  value
    .replace(/\.(swf|jsdos|zip|7z|nes|fds|unf|unif|pce|md|gen|smd|bin|sms|gg|sg|cue|iso|chd|cso|isz|elf|gba|gbc|gb)$/i, "")
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
      : mode === "ps2"
      ? /\.(iso|cso|chd|isz|bin|elf)$/i
      : mode === "gba"
      ? /\.(gba|gbc|gb)$/i
      : mode === "sega"
      ? /\.(md|gen|smd|bin|sms|gg|sg|cue|iso|chd)$/i
      : mode === "pcengine"
      ? /\.pce$/i
      : /\.(nes|fds|unf|unif)$/i;

  return file.replace(extension, "");
};

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
