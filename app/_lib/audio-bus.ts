// Routes every Web Audio context (Ruffle, js-dos, libretro cores, Play!) through one master gain
// so the memory panel's volume and mute controls reach all emulators.
type BusState = { gains: Set<GainNode>; level: number; installed: boolean };

const globalScope = globalThis as typeof globalThis & { __flashbackAudioBus?: BusState };

const state: BusState = (globalScope.__flashbackAudioBus ??= { gains: new Set(), level: 0.7, installed: false });

const applyLevel = (gain: GainNode) => {
  try {
    gain.gain.setTargetAtTime(state.level, gain.context.currentTime, 0.01);
  } catch {
    gain.gain.value = state.level;
  }
};

export function installAudioBus() {
  if (typeof window === "undefined" || state.installed) {
    return;
  }

  const proto = (window.BaseAudioContext ?? window.AudioContext)?.prototype;
  const descriptor = proto ? Object.getOwnPropertyDescriptor(proto, "destination") : undefined;
  if (!proto || !descriptor?.get) {
    return;
  }

  state.installed = true;
  const realGetter = descriptor.get;
  const masters = new WeakMap<BaseAudioContext, GainNode>();

  Object.defineProperty(proto, "destination", {
    configurable: true,
    enumerable: descriptor.enumerable,
    get(this: BaseAudioContext) {
      const realDestination = realGetter.call(this) as AudioDestinationNode;
      if (typeof (this as AudioContext).createGain !== "function" || this instanceof OfflineAudioContext) {
        return realDestination;
      }

      let master = masters.get(this);
      if (!master) {
        master = (this as AudioContext).createGain();
        master.gain.value = state.level;
        master.connect(realDestination);
        Object.defineProperty(master, "maxChannelCount", { value: realDestination.maxChannelCount });
        masters.set(this, master);
        state.gains.add(master);
      }

      return master as unknown as AudioDestinationNode;
    },
  });
}

export function getAudioBusLevel() {
  return state.level;
}

export function setAudioBusLevel(level: number) {
  state.level = Math.min(1, Math.max(0, level));
  state.gains.forEach((gain) => {
    if (gain.context.state === "closed") {
      state.gains.delete(gain);
      return;
    }

    applyLevel(gain);
  });

  document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((element) => {
    element.volume = state.level;
  });
}

installAudioBus();
