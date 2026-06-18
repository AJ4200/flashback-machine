export type Game = {
  file: string;
  title: string;
  path: string;
  flavor: string;
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
  };
  load?: (options: { url: string; autoplay?: "auto" | "on" | "off" }) => Promise<unknown>;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    RufflePlayer?: {
      config?: Record<string, unknown>;
      newest: () => {
        createPlayer: () => RufflePlayerElement;
      };
    };
  }
}
