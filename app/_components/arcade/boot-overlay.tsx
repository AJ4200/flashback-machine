export type BootEntry = {
  id: string;
  label: string;
  className: string;
  // undefined means the engine is loaded on demand, so its bar follows the boot sequence.
  ready?: boolean;
  error?: boolean;
};

export type BootGroup = {
  id: string;
  title: string;
  className: string;
  entries: BootEntry[];
};

type BootOverlayProps = {
  bootGroups: BootGroup[];
  bootProgress: number;
  bootReady: boolean;
  bootStarted: boolean;
  onStart: () => void;
};

const TICK_CELLS = [
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 5],
  [4, 4],
  [5, 3],
  [6, 2],
  [7, 1],
];

function PixelTick() {
  return (
    <svg aria-hidden="true" className="boot-tick" shapeRendering="crispEdges" viewBox="0 0 8 8">
      {TICK_CELLS.map(([x, y]) => (
        <rect height="2" key={`${x}-${y}`} width="1" x={x} y={y} />
      ))}
    </svg>
  );
}

function entryProgress(entry: BootEntry, index: number, total: number, bootProgress: number) {
  const stagger = (index / Math.max(1, total)) * 40;
  const timed = Math.min(100, Math.max(0, ((bootProgress - stagger) / (100 - stagger)) * 100));

  if (entry.error) {
    return Math.min(timed, 60);
  }

  return entry.ready === undefined ? timed : entry.ready ? timed : Math.min(timed, 90);
}

export function BootOverlay({ bootGroups, bootProgress, bootReady, bootStarted, onStart }: BootOverlayProps) {
  const total = bootGroups.reduce((count, group) => count + group.entries.length, 0);
  let index = 0;

  return (
    <div className={`boot-overlay ${bootStarted ? "is-hidden" : ""}`}>
      <div className="boot-box">
        <div className="boot-brand">
          <img src="/icons/flashback-machine-192.png" alt="FlashBack Machine arcade logo" width="72" height="72" />
          <p>FLASHBACK MACHINE BOOT DISK</p>
        </div>
        <div className="boot-groups">
          {bootGroups.map((group) => (
            <section className="boot-group" key={group.id}>
              <h2 className={group.className}>{group.title}</h2>
              <ul>
                {group.entries.map((entry) => {
                  const progress = entryProgress(entry, index, total, bootProgress);
                  index += 1;
                  const done = progress >= 100 && !entry.error;

                  return (
                    <li className={`boot-entry ${entry.className} ${done ? "is-done" : ""} ${entry.error ? "is-error" : ""}`} key={entry.id}>
                      <span className="boot-entry-label">{entry.label}</span>
                      <span className="boot-entry-bar">
                        <span style={{ width: `${progress}%` }} />
                      </span>
                      <span className="boot-entry-state">{entry.error ? "X" : done ? <PixelTick /> : null}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <p className="boot-note">KEYBOARD + USB / BLUETOOTH GAMEPAD: PER-SYSTEM MAPPINGS</p>
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
