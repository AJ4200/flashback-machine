import type { GameMode } from "../../_lib/types";

type MarqueeProps = {
  mode: GameMode;
  playerStatus: string;
  ruffleReady: boolean;
};

export function Marquee({ mode, playerStatus, ruffleReady }: MarqueeProps) {
  return (
    <section className="marquee">
      <div className="brand-lockup">
        <img className="brand-logo" src="/icons/flashback-machine-192.png" alt="FlashBack Machine arcade logo" width="96" height="96" />
        <div>
          <p className="eyebrow">{mode === "flash" ? "CLASSIC FLASH ARCADE" : "DOS CABINET EXPANSION"}</p>
          <h1>{mode === "flash" ? "FlashBack Machine" : "DOSBack Machine"}</h1>
        </div>
      </div>
      <div className="marquee-status">
        <span>{mode === "flash" ? (ruffleReady ? "RUFFLE ONLINE" : "RUFFLE BOOTING") : "JS DOS ONLINE"}</span>
        <strong>{playerStatus}</strong>
      </div>
    </section>
  );
}
