import type { GameMode } from "../../_lib/types";

type MarqueeProps = {
  mode: GameMode;
  playerStatus: string;
  ruffleReady: boolean;
};

export function Marquee({ mode, playerStatus, ruffleReady }: MarqueeProps) {
  const engineLabel = "FLASHBACK ENGINE";
  const modeTag =
    mode === "jsdos"
      ? "JSDOS DOS LIBRARY"
      : mode === "nes"
      ? "NES NESTOPIA CORE"
      : mode === "mame"
      ? "MAME 2003-PLUS CORE"
      : mode === "sega"
      ? "SEGA GENESIS PLUS GX CORE"
      : undefined;
  const runtimeStatus = mode === "flash" ? (ruffleReady ? "RUFFLE ONLINE" : "RUFFLE BOOTING") : ruffleReady ? `${mode.toUpperCase()} ONLINE` : `${mode.toUpperCase()} BOOTING`;

  return (
    <section className="marquee">
      <div className="brand-lockup">
        <img className="brand-logo" src="/icons/flashback-machine-192.png" alt="FlashBack Machine arcade logo" width="96" height="96" />
        <div>
          <p className="eyebrow">{engineLabel}</p>
          <h1>FlashBack Machine</h1>
          {modeTag ? <p className="mode-tag">{modeTag}</p> : null}
        </div>
      </div>
      <div className="marquee-status">
        <span>{runtimeStatus}</span>
        <strong>{playerStatus}</strong>
      </div>
    </section>
  );
}
