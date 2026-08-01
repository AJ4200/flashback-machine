import type { GameMode } from "../../_lib/types";

type MarqueeProps = {
  mode: GameMode;
  playerStatus: string;
  ruffleReady: boolean;
};

export function Marquee({ mode, playerStatus, ruffleReady }: MarqueeProps) {
  const engineName = mode === "flash" ? "FlashBack" : mode === "jsdos" ? "DOSBack" : `${mode.toUpperCase()}Back`;
  const engineLabel = mode === "flash" ? "CLASSIC FLASH ARCADE" : `${mode.toUpperCase()} CABINET EXPANSION`;
  const runtimeStatus = mode === "flash" ? (ruffleReady ? "RUFFLE ONLINE" : "RUFFLE BOOTING") : mode === "jsdos" ? "JS DOS ONLINE" : `${mode.toUpperCase()} ENGINE SLOT`;

  return (
    <section className="marquee">
      <div className="brand-lockup">
        <img className="brand-logo" src="/icons/flashback-machine-192.png" alt="FlashBack Machine arcade logo" width="96" height="96" />
        <div>
          <p className="eyebrow">{engineLabel}</p>
            <h1>{engineName} Machine</h1>
        </div>
      </div>
      <div className="marquee-status">
        <span>{runtimeStatus}</span>
        <strong>{playerStatus}</strong>
      </div>
    </section>
  );
}
