import { BOOT_LINES } from "../../_lib/constants";

type BootOverlayProps = {
  bootProgress: number;
  bootReady: boolean;
  bootStarted: boolean;
  onStart: () => void;
};

export function BootOverlay({ bootProgress, bootReady, bootStarted, onStart }: BootOverlayProps) {
  return (
    <div className={`boot-overlay ${bootStarted ? "is-hidden" : ""}`}>
      <div className="boot-box">
        <div className="boot-brand">
          <img src="/icons/retronet-192.png" alt="RetroNet arcade logo" width="72" height="72" />
          <p>RETRO NET BOOT DISK</p>
        </div>
        <div className="boot-lines">
          {BOOT_LINES.slice(0, Math.max(1, Math.ceil((bootProgress / 100) * BOOT_LINES.length))).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className="boot-meter">
          <span style={{ width: `${bootProgress}%` }} />
        </div>
        <button className={bootReady ? "is-ready" : ""} disabled={!bootReady} onClick={onStart} type="button">
          {bootReady ? "press start" : "loading"}
        </button>
      </div>
    </div>
  );
}
