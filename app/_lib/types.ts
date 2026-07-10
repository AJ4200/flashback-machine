export type GameMode = "flash" | "jsdos";

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
    load: (options: { url: string; autoplay?: "auto" | "on" | "off" }) => Promise<unknown>;
    volume?: number;
  };
  load?: (options: { url: string; autoplay?: "auto" | "on" | "off" }) => Promise<unknown>;
  volume?: number;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    Dos?: (root: HTMLElement, options?: Record<string, unknown>) => unknown;
    RufflePlayer?: {
      config?: Record<string, unknown>;
      newest: () => {
        createPlayer: () => RufflePlayerElement;
      };
    };
  }
}
