"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type Ps2Runtime = {
  FS: {
    analyzePath: (path: string) => { exists: boolean };
    mkdir: (path: string) => void;
  };
  HEAPU8: Uint8Array;
  ccall: (name: string, returnType: string, argumentTypes: string[], arguments_: unknown[]) => unknown;
  discImageDevice?: Ps2DiscImageDevice;
  bootDiscImage: (path: string) => void;
  quit?: (status: number) => void;
  PThread?: {
    terminateAllThreads?: () => void;
  };
};

type Ps2DiscImageDevice = {
  setFile: (file: Blob) => void;
  getFileSize: () => number;
  read: (destination: number, offset: number, size: number) => void;
  isDone: () => boolean;
};

type Ps2ModuleOptions = Record<string, unknown> & {
  canvas: HTMLCanvasElement;
  locateFile: (path: string) => string;
  mainScriptUrlOrBlob: string;
};

type Ps2ModuleFactory = (options: Ps2ModuleOptions) => Promise<Ps2Runtime>;

const PS2_RUNTIME_PATH = "/emulators/ps2";
const PLAY_JS_URL = `${PS2_RUNTIME_PATH}/Play.js`;
const PLAY_WASM_URL = `${PS2_RUNTIME_PATH}/Play.wasm`;

let playFactoryPromise: Promise<Ps2ModuleFactory> | undefined;

function loadPlayFactory() {
  if (!playFactoryPromise) {
    playFactoryPromise = (async () => {
      const response = await fetch(PLAY_JS_URL);
      if (!response.ok) {
        throw new Error(`Play! emulator script request failed (${response.status})`);
      }

      const dynamicImport = new Function("url", "return import(url);") as (
        url: string,
      ) => Promise<{ default?: unknown }>;
      const emulatorModule = await dynamicImport(new URL(PLAY_JS_URL, window.location.href).href);
      if (typeof emulatorModule.default !== "function") {
        throw new Error("Play! emulator factory is unavailable");
      }

      return emulatorModule.default as Ps2ModuleFactory;
    })().catch((error: unknown) => {
      playFactoryPromise = undefined;
      throw error;
    });
  }

  return playFactoryPromise;
}

function createDiscImageDevice(runtime: Ps2Runtime): Ps2DiscImageDevice {
  let file: Blob | undefined;
  let readPending = false;
  let readFailure: unknown;

  return {
    setFile(nextFile) {
      file = nextFile;
      readFailure = undefined;
      readPending = false;
    },
    getFileSize() {
      if (!file) {
        throw new Error("No PS2 disc image is loaded");
      }

      return file.size;
    },
    read(destination, offset, size) {
      if (!file) {
        throw new Error("No PS2 disc image is loaded");
      }

      readPending = true;
      void file
        .slice(offset, offset + size)
        .arrayBuffer()
        .then((buffer) => {
          const data = new Uint8Array(buffer);
          if (destination + data.length > runtime.HEAPU8.length) {
            throw new Error("PS2 emulator requested data outside its memory");
          }
          runtime.HEAPU8.set(data, destination);
        })
        .catch((error: unknown) => {
          readFailure = error;
        })
        .finally(() => {
          readPending = false;
        });
    },
    isDone() {
      if (readFailure) {
        throw readFailure;
      }

      return !readPending;
    },
  };
}

type UsePs2PlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

export function usePs2Player({ mountRef, reloadToken, selectedGame, setNotice }: UsePs2PlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const [ready, setReady] = useState(false);
  const moduleInstance = useRef<Ps2Runtime | null>(null);

  useEffect(() => {
    if (!selectedGame || selectedGame.mode !== "ps2") {
      moduleInstance.current = null;
      setPlayerStatus("waiting for game");
      setReady(false);
      return;
    }

    if (!mountRef.current) {
      return;
    }

    let cancelled = false;
    const mount = mountRef.current;
    mount.replaceChildren();

    const canvas = document.createElement("canvas");
    canvas.id = "outputCanvas";
    canvas.width = 640;
    canvas.height = 480;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.tabIndex = -1;
    mount.appendChild(canvas);

    const boot = async () => {
      let runtime: Ps2Runtime | null = null;

      try {
        setReady(false);
        setPlayerStatus("loading Play! PS2 emulator");

        const response = await fetch(selectedGame.path);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${selectedGame.file} (${response.status})`);
        }
        const discImage = await response.blob();
        if (discImage.size === 0) {
          throw new Error(`PS2 disc image ${selectedGame.file} is empty`);
        }

        if (cancelled) {
          return;
        }

        const createModule = await loadPlayFactory();
        runtime = await createModule({
          canvas,
          mainScriptUrlOrBlob: new URL(PLAY_JS_URL, window.location.href).href,
          locateFile: (path) => (path.endsWith(".wasm") ? PLAY_WASM_URL : `${PS2_RUNTIME_PATH}/${path}`),
          print: console.log,
          printErr: console.error,
        });
        moduleInstance.current = runtime;

        if (cancelled) {
          runtime.PThread?.terminateAllThreads?.();
          runtime.quit?.(0);
          return;
        }

        if (!runtime.FS.analyzePath("/work").exists) {
          runtime.FS.mkdir("/work");
        }

        const discImageDevice = createDiscImageDevice(runtime);
        discImageDevice.setFile(discImage);
        runtime.discImageDevice = discImageDevice;
        runtime.ccall("initVm", "", [], []);
        runtime.bootDiscImage(selectedGame.file);

        setReady(true);
        setPlayerStatus("live");
        setNotice(`${selectedGame.title} inserted (Play! PS2)`);
      } catch (error) {
        console.error(error);
        setPlayerStatus(`PS2 runtime error: ${error instanceof Error ? error.message : String(error)}`);
        setNotice("PS2 could not load this disc image");
        if (runtime && moduleInstance.current === runtime) {
          moduleInstance.current = null;
        }
        if (runtime?.quit) {
          try {
            runtime.PThread?.terminateAllThreads?.();
            runtime.quit(0);
          } catch (shutdownError) {
            console.error("Could not stop the failed PS2 runtime", shutdownError);
          }
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
      const runtime = moduleInstance.current;
      moduleInstance.current = null;
      if (runtime?.quit) {
        try {
          runtime.PThread?.terminateAllThreads?.();
          runtime.quit(0);
        } catch (error) {
          console.error("Could not stop the PS2 runtime", error);
        }
      }
      mount.replaceChildren();
    };
  }, [mountRef, reloadToken, selectedGame, setNotice]);

  return { playerStatus, ready };
}
