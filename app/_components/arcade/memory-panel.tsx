import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useGamepadControls } from "../../_hooks/use-gamepad-controls";
import { gameFileAccept, slugFor } from "../../_lib/games";
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
  isLocalGame: boolean;
  loadSlot: (slot: number) => void;
  localRomName?: string;
  mode: GameMode;
  mountRef: RefObject<HTMLDivElement | null>;
  muted: boolean;
  notice: string;
  onLoadLocalFile: (file: File) => void;
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
  pcengine: {
    label: "pc engine",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M8 10v4m-2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="15" cy="11" r="1.2" fill="currentColor" />
        <circle cx="18" cy="13" r="1.2" fill="currentColor" />
      </svg>
    ),
    status: "new",
  },
} satisfies Record<GameMode, { label: string; icon: ReactNode; status: string | null }>;

const MODE_ORDER: GameMode[] = ["flash", "gba", "jsdos", "mame", "nes", "pcengine", "ps2", "sega"];

export function MemoryPanel({
  activityLines,
  cacheBusy,
  cacheLibrary,
  cacheSelectedGame,
  canInstall,
  clearSlot,
  gameCount,
  installPwa,
  isLocalGame,
  loadSlot,
  localRomName,
  mode,
  mountRef,
  muted,
  notice,
  onLoadLocalFile,
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
  const [keyboardCaptureAction, setKeyboardCaptureAction] = useState<string | null>(null);
  const terminalRef = useRef<HTMLOListElement>(null);
  const currentOption = MODE_BUTTONS[mode];
  const {
    activeMappings,
    activeControlIds,
    buttonLabel,
    capturingAction,
    controllerStatus,
    resetMappings,
    setKeyboardMapping,
    startGamepadCapture,
  } = useGamepadControls(mode, Boolean(selectedGame), mountRef);
  const controllerConnected = !["checking gamepads", "Gamepad API unavailable", "no controller connected"].includes(controllerStatus);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activityLines]);

  useEffect(() => {
    setKeyboardCaptureAction(null);
  }, [mode]);

  useEffect(() => {
    if (!keyboardCaptureAction) {
      return;
    }

    const captureKey = (event: KeyboardEvent) => {
      if (!event.isTrusted) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setKeyboardMapping(keyboardCaptureAction, event.code);
      setKeyboardCaptureAction(null);
    };

    window.addEventListener("keydown", captureKey, true);
    return () => window.removeEventListener("keydown", captureKey, true);
  }, [keyboardCaptureAction, setKeyboardMapping]);

  return (
    <div className="memory-column">
      <div className="emulator-selector">
        <div className="emulator-tools">
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
          <label className={`local-rom-button ${isLocalGame ? "has-local-rom" : ""}`}>
            <input
              accept={gameFileAccept(mode)}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) {
                  onLoadLocalFile(file);
                }
                event.currentTarget.value = "";
              }}
              type="file"
            />
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" />
            </svg>
            <span>{localRomName ? `local: ${localRomName}` : "load local file"}</span>
          </label>
        </div>
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

      <aside className="memory-panel" aria-label="Memory card and emulator settings">
        <div className="panel-header">
          <span>memory card</span>
          <strong>{notice}</strong>
        </div>

        <details className="memory-section memory-terminal" open>
          <summary className="memory-section-summary">
            <span className="memory-section-title">
              <strong>live terminal</strong>
              <small>emulator activity</small>
            </span>
            <span className="memory-section-toggle" aria-hidden="true" />
          </summary>
          <section className="live-terminal" aria-label="Emulator activity terminal">
            <div className="terminal-heading">
              <span>runtime log</span>
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
        </details>

        <details className="controller-mapping memory-section">
          <summary>
            <span className="controller-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.1 3.2a2 2 0 0 1-3.2.9L14 15h-4l-2.5 2.3a2 2 0 0 1-3.2-.9l-1.1-3.2A4 4 0 0 1 7 8Z" />
                <path d="M7 10.5v4m-2-2h4m7-1h.01M18 13h.01" />
              </svg>
            </span>
            <span className="controller-card-title">
              <strong>controller setup</strong>
              <small>keyboard + gamepad controls</small>
            </span>
            <span className="controller-card-toggle" aria-hidden="true" />
          </summary>
          <div className="controller-card-content">
            <div className={`controller-device-card ${controllerConnected ? "is-connected" : ""}`}>
              <span className="controller-device-indicator" aria-hidden="true" />
              <span className="controller-device-info">
                <small>controller status</small>
                <strong>{controllerStatus}</strong>
              </span>
              <span className="controller-device-type" role="group" aria-label="Supported controller connections">
                <span className="controller-device-type-item" title="USB controller">
                  <svg className="controller-device-icon usb-icon" viewBox="0 0 24 24" role="img" aria-label="USB">
                    <path d="M12 21V4m0 0L8.5 7.5M12 4l3.5 3.5M12 13l-5-5m5 2 5-5M7 8v5" />
                    <circle cx="7" cy="15" r="2" />
                    <rect x="15" y="2" width="4" height="4" />
                    <path d="M10.5 21h3L12 18z" />
                  </svg>
                </span>
                <span className="controller-device-type-item" title="Bluetooth controller">
                  <svg className="controller-device-icon bluetooth-icon" viewBox="0 0 24 24" role="img" aria-label="Bluetooth">
                    <path d="M12 3v18l6-5-12-10m0 12L18 8l-6-5" />
                  </svg>
                </span>
              </span>
            </div>
            <p className="controller-help">
              Connect a USB or Bluetooth gamepad. Standard Xbox 360 layouts work automatically. Press a mapped input to test it, or select a binding to change it.
            </p>
            <div className={`controller-test-readout ${activeControlIds.length ? "is-active" : ""}`} role="status" aria-live="polite">
              <span className="controller-test-icon" aria-hidden="true">{activeControlIds.length ? "✓" : "TEST"}</span>
              <span className="controller-test-copy">
                <small>{activeControlIds.length ? "input detected" : "live input test"}</small>
                <strong>
                  {activeControlIds.length
                    ? activeMappings.filter((binding) => activeControlIds.includes(binding.id)).map((binding) => binding.label).join(", ")
                    : "Press a mapped key or controller button"}
                </strong>
              </span>
            </div>
            <div className="controller-binding-heading">
              <span>control map</span>
              <small>{activeMappings.length} inputs</small>
            </div>
            <div className="controller-binding-list">
              {activeMappings.map((binding) => (
                <div className={`controller-binding ${activeControlIds.includes(binding.id) ? "is-active" : ""}`} key={binding.id}>
                  <strong>{binding.label}</strong>
                  <button
                    className={`control-map-button ${keyboardCaptureAction === binding.id ? "is-capturing" : ""}`}
                    aria-label={`Change keyboard mapping for ${binding.label}`}
                    onClick={() => setKeyboardCaptureAction((current) => (current === binding.id ? null : binding.id))}
                    type="button"
                  >
                    <span>keyboard</span>
                    <b>{keyboardCaptureAction === binding.id ? "press key..." : binding.keyboardCode.replace("Arrow", "")}</b>
                  </button>
                  <button
                    className="control-map-button gamepad-map-button"
                    aria-label={`Change gamepad mapping for ${binding.label}`}
                    onClick={() => startGamepadCapture(binding.id)}
                    type="button"
                  >
                    <span>gamepad</span>
                    <b>{capturingAction === binding.id ? "press button..." : buttonLabel(binding.gamepadButton)}</b>
                  </button>
                </div>
              ))}
            </div>
            <button className="control-reset-button" onClick={resetMappings} type="button">
              reset {currentOption.label} controls
            </button>
          </div>
        </details>

        <details className="memory-section">
          <summary className="memory-section-summary">
            <span className="memory-section-title"><strong>save slots</strong><small>game progress</small></span>
            <span className="memory-section-toggle" aria-hidden="true" />
          </summary>
          <div className="save-slots">
            {saveSlots.map((slot) => (
              <div className="save-slot" key={slot.id}>
                <div>
                  <strong>slot {slot.id}</strong>
                  <small>{slot.createdAt ? new Date(slot.createdAt).toLocaleString() : "empty"}</small>
                </div>
                <div className="slot-actions">
                  <button onClick={() => saveSlot(slot.id)} type="button">save</button>
                  <button disabled={!slot.createdAt} onClick={() => loadSlot(slot.id)} type="button">load</button>
                  <button disabled={!slot.createdAt} onClick={() => clearSlot(slot.id)} type="button">clear</button>
                </div>
              </div>
            ))}
          </div>
        </details>

        <details className="memory-section">
          <summary className="memory-section-summary">
            <span className="memory-section-title"><strong>auto memory</strong><small>current game data</small></span>
            <span className="memory-section-toggle" aria-hidden="true" />
          </summary>
          <div className="system-readout">
            <span>active game</span>
            <strong>{selectedGame ? slugFor(selectedGame.file) : "idle"}</strong>
          </div>
        </details>

        <details className="memory-section">
          <summary className="memory-section-summary">
            <span className="memory-section-title"><strong>audio controls</strong><small>volume and sound</small></span>
            <span className="memory-section-toggle" aria-hidden="true" />
          </summary>
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
        </details>

        <details className="memory-section">
          <summary className="memory-section-summary">
            <span className="memory-section-title"><strong>offline deck</strong><small>install and cache</small></span>
            <span className="memory-section-toggle" aria-hidden="true" />
          </summary>
          <div className="pwa-panel">
            <div>
              <span>offline status</span>
              <strong>{pwaStatus}</strong>
            </div>
            <button disabled={!canInstall} onClick={installPwa} type="button">install</button>
            <button disabled={cacheBusy || !selectedGame || isLocalGame} onClick={cacheSelectedGame} type="button">
              cache game
            </button>
            <button disabled={cacheBusy || gameCount === 0} onClick={cacheLibrary} type="button">cache all</button>
          </div>
        </details>
      </aside>
    </div>
  );
}
