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
  notice: string;
  pwaStatus: string;
  saveSlot: (slot: number) => void;
  saveSlots: SaveSlot[];
  selectedGame?: Game;
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
  notice,
  pwaStatus,
  saveSlot,
  saveSlots,
  selectedGame,
}: MemoryPanelProps) {
  return (
    <aside className="memory-panel" aria-label="Save states">
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
