import type { GameMode } from "./types";

export const FLASH_CATALOG_PATH = "/games/flash/flashlist.json";
export const GBA_CATALOG_PATH = "/games/gba/gbalist.json";
export const J2ME_CATALOG_PATH = "/games/j2me/j2melist.json";
export const PS1_CATALOG_PATH = "/games/ps1/ps1list.json";
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
    case "j2me":
      return J2ME_CATALOG_PATH;
    case "ps1":
      return PS1_CATALOG_PATH;
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
    case "j2me":
      return [/\.jar$/i, /\.jad$/i];
    case "ps1":
      return [/\.cue$/i, /\.bin$/i, /\.iso$/i, /\.img$/i, /\.chd$/i, /\.pbp$/i, /\.m3u$/i];
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
      return [/\.md$/i, /\.mdx$/i, /\.gen$/i, /\.smd$/i, /\.bin$/i, /\.sms$/i, /\.gg$/i, /\.sg$/i, /\.cue$/i, /\.iso$/i, /\.chd$/i];
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
    .replace(/\.(swf|jsdos|zip|7z|nes|fds|unf|unif|pce|md|mdx|gen|smd|bin|sms|gg|sg|cue|iso|chd|cso|isz|elf|gba|gbc|gb|jar|jad|img|pbp|m3u)$/i, "")
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
      : mode === "j2me"
      ? /\.(jar|jad)$/i
      : mode === "ps1"
      ? /\.(cue|bin|iso|img|chd|pbp|m3u)$/i
      : mode === "ps2"
      ? /\.(iso|cso|chd|isz|bin|elf)$/i
      : mode === "gba"
      ? /\.(gba|gbc|gb)$/i
      : mode === "sega"
      ? /\.(md|mdx|gen|smd|bin|sms|gg|sg|cue|iso|chd)$/i
      : mode === "pcengine"
      ? /\.pce$/i
      : /\.(nes|fds|unf|unif)$/i;

  return file.replace(extension, "");
};

const DETECTION_ORDER: GameMode[] = ["flash", "jsdos", "j2me", "gba", "nes", "pcengine", "sega", "ps1", "ps2", "mame"];
const PS2_MIN_BYTES = 800 * 1024 * 1024;

// Picks the emulator that can run a file. The current mode wins when it supports the file,
// except for ambiguous disc images, where size separates PS1 CDs from PS2 DVDs.
export const detectGameMode = (file: string, currentMode: GameMode, size?: number): GameMode | undefined => {
  const candidates = DETECTION_ORDER.filter((mode) => isSupportedGameFile(mode, file));
  if (candidates.length === 0) {
    return undefined;
  }

  if (candidates.includes(currentMode) && (currentMode === "sega" || currentMode === "mame")) {
    return currentMode;
  }

  if (typeof size === "number" && candidates.includes("ps1") && candidates.includes("ps2")) {
    return size >= PS2_MIN_BYTES ? "ps2" : "ps1";
  }

  return candidates.includes(currentMode) ? currentMode : candidates[0];
};

const SEGA_ARCHIVE_ENTRY = /\.(md|mdx|gen|smd|sms|gg|sg)$/i;
const OTHER_ROM_ENTRY = /\.(nes|fds|unf|unif|pce|gba|gbc|gb|swf|jar|jad|cue|iso|chd)$/i;

const asciiAt = (bytes: Uint8Array, offset: number, text: string) =>
  bytes.length >= offset + text.length && text.split("").every((char, index) => bytes[offset + index] === char.charCodeAt(0));

// Recognises Sega cartridge and disc headers: Mega Drive/Genesis, interleaved SMD dumps, Master System/Game Gear and Sega CD.
const looksLikeSegaImage = (bytes: Uint8Array) =>
  asciiAt(bytes, 0x100, "SEGA") ||
  asciiAt(bytes, 0x7ff0, "TMR SEGA") ||
  asciiAt(bytes, 0x3ff0, "TMR SEGA") ||
  asciiAt(bytes, 0x1ff0, "TMR SEGA") ||
  asciiAt(bytes, 0, "SEGADISCSYSTEM") ||
  asciiAt(bytes, 0x10, "SEGADISCSYSTEM") ||
  (bytes[8] === 0xaa && bytes[9] === 0xbb && bytes[1] === 0x03);

async function zipEntryNames(file: File) {
  const tailSize = Math.min(file.size, 0x10000 + 22);
  const tail = new Uint8Array(await file.slice(file.size - tailSize).arrayBuffer());
  const view = new DataView(tail.buffer);
  for (let offset = tail.length - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) !== 0x06054b50) {
      continue;
    }

    const directorySize = view.getUint32(offset + 12, true);
    const directoryOffset = view.getUint32(offset + 16, true);
    if (directoryOffset + directorySize > file.size) {
      return [];
    }

    const directory = new Uint8Array(await file.slice(directoryOffset, directoryOffset + directorySize).arrayBuffer());
    const directoryView = new DataView(directory.buffer);
    const decoder = new TextDecoder();
    const names: string[] = [];
    for (let cursor = 0; cursor + 46 <= directory.length && directoryView.getUint32(cursor, true) === 0x02014b50; ) {
      const nameLength = directoryView.getUint16(cursor + 28, true);
      const extraLength = directoryView.getUint16(cursor + 30, true);
      const commentLength = directoryView.getUint16(cursor + 32, true);
      names.push(decoder.decode(directory.subarray(cursor + 46, cursor + 46 + nameLength)));
      cursor += 46 + nameLength + extraLength + commentLength;
    }

    return names;
  }

  return [];
}

// Looks inside a file for Sega content that the extension alone cannot reveal (.bin, .iso, .zip).
export const sniffSegaGame = async (file: File): Promise<boolean> => {
  try {
    if (/\.zip$/i.test(file.name)) {
      const names = await zipEntryNames(file);
      return names.some((name) => SEGA_ARCHIVE_ENTRY.test(name)) && !names.some((name) => OTHER_ROM_ENTRY.test(name));
    }

    if (/\.(bin|iso|img|smd|md|gen|mdx|sms|gg|sg)$/i.test(file.name)) {
      return looksLikeSegaImage(new Uint8Array(await file.slice(0, 0x8000 + 16).arrayBuffer()));
    }
  } catch (error) {
    console.warn("Could not inspect game file", error);
  }

  return false;
};

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
