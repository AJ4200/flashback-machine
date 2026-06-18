type MarqueeProps = {
  playerStatus: string;
  ruffleReady: boolean;
};

export function Marquee({ playerStatus, ruffleReady }: MarqueeProps) {
  return (
    <section className="marquee">
      <div className="brand-lockup">
        <img className="brand-logo" src="/icons/retronet-192.png" alt="RetroNet arcade logo" width="96" height="96" />
        <div>
          <p className="eyebrow">RETRO ARCADE NETWORK</p>
          <h1>RetroNet</h1>
        </div>
      </div>
      <div className="marquee-status">
        <span>{ruffleReady ? "RUFFLE ONLINE" : "RUFFLE BOOTING"}</span>
        <strong>{playerStatus}</strong>
      </div>
    </section>
  );
}
