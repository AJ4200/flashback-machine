type BootLinePart = {
  text: string;
  className?: string;
};

export type BootLine = {
  id: string;
  parts: BootLinePart[];
};

type BootOverlayProps = {
  bootLines: BootLine[];
  bootProgress: number;
  bootReady: boolean;
  bootStarted: boolean;
  onStart: () => void;
};

export function BootOverlay({ bootLines, bootProgress, bootReady, bootStarted, onStart }: BootOverlayProps) {
  return (
    <div className={`boot-overlay ${bootStarted ? "is-hidden" : ""}`}>
      <div className="boot-box">
        <div className="boot-brand">
          <img src="/icons/flashback-machine-192.png" alt="FlashBack Machine arcade logo" width="72" height="72" />
          <p>FLASHBACK MACHINE BOOT DISK</p>
        </div>
        <div className="boot-lines">
          {bootLines.slice(0, Math.max(1, Math.ceil((bootProgress / 100) * bootLines.length))).map((line) => (
            <span key={line.id}>
              {line.parts.map((part, index) => (
                <span className={part.className} key={`${line.id}-${index}`}>
                  {part.text}
                </span>
              ))}
            </span>
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
