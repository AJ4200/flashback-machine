import { useEffect, useRef, useState, type ReactNode } from "react";
import { slugFor } from "../../_lib/games";
import type { Game, GameMode, SaveSlot } from "../../_lib/types";

export type ActivityLine = {
  id: number;
  time: string;
  message: string;
  level: "info" | "error";
};

type MemoryPanelProps = {
  activityLines: ActivityLine[];
  cacheBusy: boolean;
  cacheLibrary: () => void;
  cacheSelectedGame: () => void;
  canInstall: boolean;
  clearSlot: (slot: number) => void;
  gameCount: number;
  installPwa: () => void;
  loadSlot: (slot: number) => void;
  mode: GameMode;
  muted: boolean;
  notice: string;
  onToggleMuted: () => void;
  onVolumeChange: (volume: number) => void;
  pwaStatus: string;
  saveSlot: (slot: number) => void;
  saveSlots: SaveSlot[];
  selectedGame?: Game;
  switchMode: (mode: GameMode) => void;
  volume: number;
};

const MODE_BUTTONS = {
  flash: {
    label: "flash",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 2L17 2L11 12L17 12L7 22L11 12L7 12Z" fill="currentColor" />
      </svg>
    ),
    status: null,
  },
  gba: {
    label: "game boy",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M8 5h8M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="19" r="1" fill="currentColor" />
      </svg>
    ),
    status: "new",
  },
  jsdos: {
    label: "js dos",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M7 9L11 12L7 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="13" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    status: "alpha",
  },
  mame: {
    label: "mame",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="8" cy="13" r="3" fill="currentColor" />
        <circle cx="16" cy="14" r="2" fill="currentColor" />
        <path d="M10 12L12 6L14 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M12 6V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    status: "beta",
  },
  nes: {
    label: "nes",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="7.5" cy="12.5" r="1.2" fill="currentColor" />
        <path d="M6 11.5L6 13.5M4.5 12L7.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" />
        <circle cx="19.5" cy="12.5" r="1.2" fill="currentColor" />
      </svg>
    ),
    status: "beta",
  },
  ps2: {
    label: "ps2",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 8h14a3 3 0 0 1 2.8 4l-1.4 3.5a2 2 0 0 1-3.2.7l-2.1-1.7H8.9l-2.1 1.7a2 2 0 0 1-3.2-.7L2.2 12A3 3 0 0 1 5 8Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M7 10v4m-2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="11" r="1" fill="currentColor" />
        <circle cx="18" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
    status: "new",
  },
  sega: {
    label: "sega",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 8H19L17.5 16H6.5L5 8Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M8 11H12M10 9V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="15.5" cy="12" r="1.2" fill="currentColor" />
        <circle cx="18" cy="12" r="1.2" fill="currentColor" />
      </svg>
    ),
    status: "new",
  },
} satisfies Record<GameMode, { label: string; icon: ReactNode; status: string | null }>;

const MODE_ORDER: GameMode[] = ["flash", "gba", "jsdos", "mame", "nes", "ps2", "sega"];

export function MemoryPanel({
  activityLines,
  cacheBusy,
  cacheLibrary,
  cacheSelectedGame,
  canInstall,
  clearSlot,
  gameCount,
  installPwa,
  loadSlot,
  mode,
  muted,
  notice,
  onToggleMuted,
  onVolumeChange,
  pwaStatus,
  saveSlot,
  saveSlots,
  selectedGame,
  switchMode,
  volume,
}: MemoryPanelProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const terminalRef = useRef<HTMLOListElement>(null);
  const currentOption = MODE_BUTTONS[mode];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activityLines]);

  return (
    <aside className="memory-panel" aria-label="Save data">
      <div className="panel-header">
        <span>memory card</span>
        <strong>{notice}</strong>
      </div>

      <div className="emulator-selector">
        <button
          aria-controls={selectorOpen ? "emulator-options" : undefined}
          aria-expanded={selectorOpen}
          aria-label={`Selected emulator: ${currentOption.label}. ${selectorOpen ? "Hide" : "Show"} emulator list`}
          className="emulator-selector-current"
          onClick={() => setSelectorOpen((open) => !open)}
          type="button"
        >
          <span className="emulator-selector-caption">selected emulator / click to change</span>
          <span className="mode-button-content">
            <span className="mode-button-icon">{currentOption.icon}</span>
            <strong className="mode-button-text">{currentOption.label}</strong>
          </span>
          <span className="emulator-selector-chevron" aria-hidden="true">{selectorOpen ? "-" : "+"}</span>
        </button>
        {selectorOpen ? (
          <div className="emulator-options" id="emulator-options">
            {MODE_ORDER.filter((optionMode) => optionMode !== mode).map((optionMode) => {
              const option = MODE_BUTTONS[optionMode];

              return (
                <button
                  key={optionMode}
                  className="emulator-option"
                  onClick={() => {
                    setSelectorOpen(false);
                    switchMode(optionMode);
                  }}
                  type="button"
                >
                  <span className="mode-button-icon">{option.icon}</span>
                  <span>{option.label}</span>
                  {option.status ? <small className={`mode-status-pill ${option.status}`}>{option.status}</small> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <section className="live-terminal" aria-label="Emulator activity terminal">
        <div className="terminal-heading">
          <span>live terminal</span>
          <strong>● {activityLines.length ? "connected" : "standby"}</strong>
        </div>
        <ol className="terminal-lines" ref={terminalRef} aria-live="polite" aria-relevant="additions text" role="log">
          {activityLines.map((line) => (
            <li className={`terminal-line ${line.level}`} key={line.id}>
              <time>{line.time}</time>
              <span>{line.message}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="save-slots">
        {saveSlots.map((slot) => (
          <div className="save-slot" key={slot.id}>
            <div>
              <strong>slot {slot.id}</strong>
              <small>{slot.createdAt ? new Date(slot.createdAt).toLocaleString() : "empty"}</small>
            </div>
            <div className="slot-actions">
              <button onClick={() => saveSlot(slot.id)} type="button">
                save
              </button>
              <button disabled={!slot.createdAt} onClick={() => loadSlot(slot.id)} type="button">
                load
              </button>
              <button disabled={!slot.createdAt} onClick={() => clearSlot(slot.id)} type="button">
                clear
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="system-readout">
        <span>auto memory</span>
        <strong>{selectedGame ? slugFor(selectedGame.file) : "idle"}</strong>
      </div>

      <div className="audio-deck" aria-label="Audio controls">
        <button className={muted ? "audio-mute is-muted" : "audio-mute"} onClick={onToggleMuted} type="button">
          {muted ? "muted" : "sound"}
        </button>
        <label className="volume-control">
          <span>volume</span>
          <input
            aria-label="Volume"
            max="100"
            min="0"
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            step="1"
            type="range"
            value={volume}
          />
        </label>
        <strong className="volume-readout">{muted ? "00" : volume.toString().padStart(2, "0")}</strong>
      </div>

      <div className="pwa-panel">
        <div>
          <span>pwa deck</span>
          <strong>{pwaStatus}</strong>
        </div>
        <button disabled={!canInstall} onClick={installPwa} type="button">
          install
        </button>
        <button disabled={cacheBusy || !selectedGame} onClick={cacheSelectedGame} type="button">
          cache game
        </button>
        <button disabled={cacheBusy || gameCount === 0} onClick={cacheLibrary} type="button">
          cache all
        </button>
      </div>
    </aside>
  );
}
