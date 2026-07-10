export const FLASH_CATALOG_PATH = "/games/flash/flashlist.json";

export const flashGamePath = (file: string) => `/games/flash/${encodeURIComponent(file)}`;

export const slugFor = (value: string) =>
  value
    .replace(/\.swf$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const titleFor = (file: string) => file.replace(/\.swf$/i, "");

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
