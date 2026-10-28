export type GameMode = "flash" | "gba" | "j2me" | "jsdos" | "mame" | "nes" | "pcengine" | "ps1" | "ps2" | "sega";

export type Game = {
  file: string;
  title: string;
  path: string;
  flavor: string;
  mode: GameMode;
  size?: string;
};

export type SaveSlot = {
  id: number;
  createdAt: string | null;
  count: number;
};

export type RufflePlayerElement = HTMLElement & {
  ruffle?: () => {
    destroy?: () => void;
    load: (options: { url: string; autoplay?: "auto" | "on" | "off" }) => Promise<unknown>;
    volume?: number;
  };
  destroy?: () => void;
  load?: (options: { url: string; autoplay?: "auto" | "on" | "off" }) => Promise<unknown>;
  volume?: number;
};

export type JsDosPlayerHandle = {
  stop: () => Promise<void>;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    Dos?: (root: HTMLElement, options?: Record<string, unknown>) => JsDosPlayerHandle;
    RufflePlayer?: {
      config?: Record<string, unknown>;
      newest: () => {
        createPlayer: () => RufflePlayerElement;
      };
    };
    BrowserFS?: any;
  }
}
