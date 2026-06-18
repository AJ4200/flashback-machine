import { slugFor } from "../../_lib/games";
import type { Game, SaveSlot } from "../../_lib/types";

type MemoryPanelProps = {
  cacheBusy: boolean;
  cacheLibrary: () => void;
  cacheSelectedGame: () => void;
  canInstall: boolean;
  clearSlot: (slot: number) => void;
  gameCount: number;
  installPwa: () => void;
  loadSlot: (slot: number) => void;
  muted: boolean;
  notice: string;
  onToggleMuted: () => void;
  onVolumeChange: (volume: number) => void;
  pwaStatus: string;
  saveSlot: (slot: number) => void;
  saveSlots: SaveSlot[];
  selectedGame?: Game;
  volume: number;
};

export function MemoryPanel({
  cacheBusy,
  cacheLibrary,
  cacheSelectedGame,
  canInstall,
  clearSlot,
  gameCount,
  installPwa,
  loadSlot,
  muted,
  notice,
  onToggleMuted,
  onVolumeChange,
  pwaStatus,
  saveSlot,
  saveSlots,
  selectedGame,
  volume,
}: MemoryPanelProps) {
  return (
    <aside className="memory-panel" aria-label="Save data">
      <div className="panel-header">
        <span>memory card</span>
        <strong>{notice}</strong>
      </div>

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
