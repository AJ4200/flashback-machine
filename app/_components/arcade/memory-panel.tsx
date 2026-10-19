import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
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
  stageRef: RefObject<HTMLDivElement | null>;
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

type SectionControls = {
  canDetach: boolean;
  detach: () => void;
  summaryDragHandlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
  };
};

type DetachableMemorySectionProps = {
  children: (controls: SectionControls) => ReactNode;
  label: string;
  order: number;
  portalHost: HTMLElement | null;
  nextZIndex: () => number;
};

function clampWindowPosition(left: number, top: number, width: number, height: number) {
  const maxLeft = Math.max(8, window.innerWidth - Math.min(width, 96));
  const maxTop = Math.max(8, window.innerHeight - Math.min(height, 48));
  return {
    left: Math.max(8, Math.min(left, maxLeft)),
    top: Math.max(8, Math.min(top, maxTop)),
  };
}

function DetachableMemorySection({ children, label, order, portalHost, nextZIndex }: DetachableMemorySectionProps) {
  const [detached, setDetached] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [zIndex, setZIndex] = useState(100 + order);
  const windowRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const summaryDragRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);
  const windowDragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);

  const raiseWindow = () => setZIndex(nextZIndex());

  const dock = () => {
    windowDragRef.current = null;
    summaryDragRef.current = null;
    setDragging(false);
    setDetached(false);
  };

  const detach = (left?: number, top?: number) => {
    if (!portalHost) {
      return;
    }

    const defaultLeft = Math.max(16, window.innerWidth - 420 - order * 28);
    const defaultTop = Math.min(24 + order * 36, Math.max(16, window.innerHeight - 120));
    setPosition(clampWindowPosition(left ?? defaultLeft, top ?? defaultTop, 380, 72));
    raiseWindow();
    setDetached(true);
  };

  const startSummaryDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!portalHost || event.button !== 0 || (event.target as HTMLElement).closest("button")) {
      return;
    }

    summaryDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
  };

  const moveSummaryDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = summaryDragRef.current;
    const section = sectionRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !section) {
      return;
    }

    const bounds = section.getBoundingClientRect();
    const outsideSection =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    const movedEnough = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 24;
    if (outsideSection && movedEnough) {
      event.preventDefault();
      summaryDragRef.current = null;
      windowDragRef.current = { pointerId: event.pointerId, offsetX: 160, offsetY: 18 };
      setDragging(true);
      detach(event.clientX - 160, event.clientY - 18);
    }
  };

  const startWindowDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) {
      return;
    }

    const bounds = windowRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    event.preventDefault();
    windowDragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    setDragging(true);
    raiseWindow();
  };

  useEffect(() => {
    if (!detached) {
      return;
    }

    const moveWindow = (event: PointerEvent) => {
      const drag = windowDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const width = windowRef.current?.offsetWidth ?? 380;
      const height = windowRef.current?.offsetHeight ?? 72;
      setPosition(clampWindowPosition(event.clientX - drag.offsetX, event.clientY - drag.offsetY, width, height));
    };

    const stopWindowDrag = (event: PointerEvent) => {
      if (windowDragRef.current?.pointerId !== event.pointerId) {
        return;
      }

      windowDragRef.current = null;
      setDragging(false);
    };

    const keepOnScreen = () => {
      const node = windowRef.current;
      setPosition((current) => clampWindowPosition(current.left, current.top, node?.offsetWidth ?? 380, node?.offsetHeight ?? 72));
    };

    window.addEventListener("pointermove", moveWindow);
    window.addEventListener("pointerup", stopWindowDrag);
    window.addEventListener("pointercancel", stopWindowDrag);
    window.addEventListener("resize", keepOnScreen);
    return () => {
      window.removeEventListener("pointermove", moveWindow);
      window.removeEventListener("pointerup", stopWindowDrag);
      window.removeEventListener("pointercancel", stopWindowDrag);
      window.removeEventListener("resize", keepOnScreen);
    };
  }, [detached]);

  const controls: SectionControls = {
    canDetach: Boolean(portalHost),
    detach: () => detach(),
    summaryDragHandlers: {
      onPointerDown: startSummaryDrag,
      onPointerMove: moveSummaryDrag,
      onPointerUp: () => {
        summaryDragRef.current = null;
      },
      onPointerCancel: () => {
        summaryDragRef.current = null;
      },
    },
  };
  const sectionContent = children(controls);

  return (
    <>
      {detached ? (
        <button className="memory-section-placeholder" onClick={dock} type="button">
          <strong>{label}</strong>
          <small>floating window · click to restore</small>
        </button>
      ) : (
        <div className="memory-section-slot" ref={sectionRef}>
          {sectionContent}
        </div>
      )}
      {detached && portalHost
        ? createPortal(
            <div
              className={`memory-floating-window${dragging ? " is-dragging" : ""}`}
              ref={windowRef}
              style={{ left: position.left, top: position.top, zIndex }}
              onPointerDown={raiseWindow}
            >
              <div className="memory-floating-window-bar" onPointerDown={startWindowDrag}>
                <span className="memory-floating-window-grip" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{label}</strong>
                <button
                  aria-label={`Minimize ${label} and return it to the memory panel`}
                  className="memory-window-minimize"
                  onClick={dock}
                  title="Minimize to memory panel"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6 16h12" />
                  </svg>
                  <span>min</span>
                </button>
              </div>
              <div className="memory-floating-window-body">{sectionContent}</div>
            </div>,
            portalHost,
          )
        : null}
    </>
  );
}

function DetachableSectionSummary({
  children,
  className,
  controls,
}: {
  children: ReactNode;
  className: string;
  controls: SectionControls;
}) {
  return (
    <summary className={className} {...controls.summaryDragHandlers}>
      {children}
      <button
        aria-label="Detach this section as a floating window"
        className="memory-section-popout"
        disabled={!controls.canDetach}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          controls.detach();
        }}
        title="Open as a floating window"
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 5h10v10M19 5 9 15M5 9v10h10" />
        </svg>
      </button>
    </summary>
  );
}

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
  stageRef,
  saveSlot,
  saveSlots,
  selectedGame,
  switchMode,
  volume,
}: MemoryPanelProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [keyboardCaptureAction, setKeyboardCaptureAction] = useState<string | null>(null);
  const [floatingWindowHost, setFloatingWindowHost] = useState<HTMLElement | null>(null);
  const terminalRef = useRef<HTMLOListElement>(null);
  const nextWindowZIndex = useRef(16);
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
    const syncHost = () => {
      const stage = stageRef.current;
      const fullscreen = document.fullscreenElement;
      const fullscreenStage = Boolean(stage && fullscreen && (fullscreen === stage || fullscreen.contains(stage)));
      const overlay = stage?.querySelector<HTMLElement>(".memory-window-layer");
      setFloatingWindowHost(fullscreenStage ? overlay ?? stage : document.body);
    };

    syncHost();
    document.addEventListener("fullscreenchange", syncHost);
    return () => document.removeEventListener("fullscreenchange", syncHost);
  }, [stageRef]);

  const raiseFloatingWindow = () => {
    nextWindowZIndex.current += 1;
    return nextWindowZIndex.current;
  };

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

        <DetachableMemorySection label="live terminal" order={0} portalHost={floatingWindowHost} nextZIndex={raiseFloatingWindow}>
          {(controls) => (
            <details className="memory-section memory-terminal" open>
              <DetachableSectionSummary className="memory-section-summary" controls={controls}>
                <span className="memory-section-title">
                  <strong>live terminal</strong>
                  <small>emulator activity</small>
                </span>
                <span className="memory-section-toggle" aria-hidden="true" />
              </DetachableSectionSummary>
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
          )}
        </DetachableMemorySection>

        <DetachableMemorySection label="controller setup" order={1} portalHost={floatingWindowHost} nextZIndex={raiseFloatingWindow}>
          {(controls) => (
            <details className="controller-mapping memory-section">
          <DetachableSectionSummary className="controller-card-summary" controls={controls}>
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
          </DetachableSectionSummary>
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
          )}
        </DetachableMemorySection>

        <DetachableMemorySection label="save slots" order={2} portalHost={floatingWindowHost} nextZIndex={raiseFloatingWindow}>
          {(controls) => (
            <details className="memory-section">
              <DetachableSectionSummary className="memory-section-summary" controls={controls}>
                <span className="memory-section-title"><strong>save slots</strong><small>game progress</small></span>
                <span className="memory-section-toggle" aria-hidden="true" />
              </DetachableSectionSummary>
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
          )}
        </DetachableMemorySection>

        <DetachableMemorySection label="auto memory" order={3} portalHost={floatingWindowHost} nextZIndex={raiseFloatingWindow}>
          {(controls) => (
            <details className="memory-section">
              <DetachableSectionSummary className="memory-section-summary" controls={controls}>
                <span className="memory-section-title"><strong>auto memory</strong><small>current game data</small></span>
                <span className="memory-section-toggle" aria-hidden="true" />
              </DetachableSectionSummary>
          <div className="system-readout">
            <span>active game</span>
            <strong>{selectedGame ? slugFor(selectedGame.file) : "idle"}</strong>
          </div>
            </details>
          )}
        </DetachableMemorySection>

        <DetachableMemorySection label="audio controls" order={4} portalHost={floatingWindowHost} nextZIndex={raiseFloatingWindow}>
          {(controls) => (
            <details className="memory-section">
              <DetachableSectionSummary className="memory-section-summary" controls={controls}>
                <span className="memory-section-title"><strong>audio controls</strong><small>volume and sound</small></span>
                <span className="memory-section-toggle" aria-hidden="true" />
              </DetachableSectionSummary>
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
          )}
        </DetachableMemorySection>

        <DetachableMemorySection label="offline deck" order={5} portalHost={floatingWindowHost} nextZIndex={raiseFloatingWindow}>
          {(controls) => (
            <details className="memory-section">
              <DetachableSectionSummary className="memory-section-summary" controls={controls}>
                <span className="memory-section-title"><strong>offline deck</strong><small>install and cache</small></span>
                <span className="memory-section-toggle" aria-hidden="true" />
              </DetachableSectionSummary>
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
          )}
        </DetachableMemorySection>
      </aside>
    </div>
  );
}
