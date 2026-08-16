"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type UseLibretroPlayerOptions = {
  core: string;
  label: string;
  mode: Game["mode"];
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

const PUBLIC_CORE_PATH = "/emulators/retroarch";
const CONTENT_ROOT = "/home/web_user/retroarch/userdata/content";

async function loadCore(core: string) {
  const remotePath = new URL(`${PUBLIC_CORE_PATH}/${core}_libretro.js`, window.location.href).href;
  const dynamicImport = new Function("url", "return import(url);");
  const coreScript = await dynamicImport(remotePath);

  if (!coreScript || typeof coreScript.default !== "function") {
    throw new Error(`${core} core script unavailable`);
  }

  return coreScript.default as (module: Record<string, unknown>) => Promise<any>;
}

function ensureDirectory(fs: any, folder: string) {
  if (!fs.analyzePath(folder).exists) {
    fs.mkdir(folder);
  }
}

export function useLibretroPlayer({ core, label, mode, mountRef, reloadToken, selectedGame, setNotice }: UseLibretroPlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const [ready, setReady] = useState(false);
  const moduleInstance = useRef<any>(null);

  useEffect(() => {
    if (!selectedGame || selectedGame.mode !== mode) {
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
    mount.innerHTML = "";

    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.minHeight = "280px";
    mount.appendChild(container);

    const boot = async () => {
      try {
        setPlayerStatus(`loading ${label} core`);

        const contentPath = `${CONTENT_ROOT}/${selectedGame.file}`;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(container.clientWidth, 640);
        canvas.height = Math.max(container.clientHeight, 480);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        container.appendChild(canvas);

        const Module = {
          noInitialRun: true,
          canvas,
          arguments: ["-v", "--load-content", contentPath],
          locateFile: (path: string) => `${PUBLIC_CORE_PATH}/${path}`,
          print: console.log,
          printErr: console.error,
          onRuntimeInitialized: () => {
            if (!cancelled) {
              setPlayerStatus("engine booted");
            }
          },
        };

        const createCore = await loadCore(core);
        const emulator = await createCore(Module);
        moduleInstance.current = emulator;
        setReady(true);

        if (cancelled) {
          return;
        }

        const romResponse = await fetch(selectedGame.path);
        if (!romResponse.ok) {
          throw new Error(`failed to fetch ${selectedGame.file}`);
        }

        const romData = new Uint8Array(await romResponse.arrayBuffer());

        if (emulator.FS) {
          for (const folder of ["/home", "/home/web_user", "/home/web_user/retroarch", "/home/web_user/retroarch/userdata", CONTENT_ROOT]) {
            ensureDirectory(emulator.FS, folder);
          }

          if (emulator.FS.analyzePath(contentPath).exists) {
            emulator.FS.unlink(contentPath);
          }

          emulator.FS.createDataFile(CONTENT_ROOT, selectedGame.file, romData, true, true);
        }

        if (typeof emulator.callMain === "function") {
          emulator.callMain(Module.arguments);
        }

        setPlayerStatus("live");
        setNotice(`${selectedGame.title} inserted`);
      } catch (error) {
        console.error(error);
        setPlayerStatus(`${label} runtime error`);
        setNotice(`${label.toUpperCase()} could not load this rom`);
      }
    };

    void boot();

    return () => {
      cancelled = true;
      if (moduleInstance.current && typeof moduleInstance.current.quit === "function") {
        try {
          moduleInstance.current.quit(0);
        } catch {
          // ignore cleanup failures
        }
      }
      moduleInstance.current = null;
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [core, label, mode, mountRef, reloadToken, selectedGame, setNotice]);

  return {
    playerStatus,
    ready,
    setPlayerStatus,
    setReady,
  };
}
