type MarqueeProps = {
  playerStatus: string;
  ruffleReady: boolean;
};

export function Marquee({ playerStatus, ruffleReady }: MarqueeProps) {
  return (
    <section className="marquee">
      <div>
        <p className="eyebrow">RETRO ARCADE NETWORK</p>
        <h1>RetroNet</h1>
      </div>
      <div className="marquee-status">
        <span>{ruffleReady ? "RUFFLE ONLINE" : "RUFFLE BOOTING"}</span>
        <strong>{playerStatus}</strong>
      </div>
    </section>
  );
}
