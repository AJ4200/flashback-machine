"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type UseLibretroPlayerOptions = {
  core: string | readonly string[];
  label: string;
  mode: Game["mode"];
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

const PUBLIC_CORE_PATH = "/emulators/retroarch";
const CONTENT_ROOT = "/home/web_user/retroarch/userdata/content";

function coreLabel(core: string) {
  const labels: Record<string, string> = {
    fceumm: "FCEUmm",
    mgba: "mGBA",
    mame2000: "MAME 2000",
    mame2003: "MAME 2003",
    mame2003_plus: "MAME 2003-Plus",
    mednafen_pce_fast: "Mednafen PCE Fast",
    pcsx_rearmed: "PCSX ReARMed",
    squirreljme: "SquirrelJME",
    nestopia: "Nestopia",
    quicknes: "QuickNES",
  };

  return labels[core] ?? core;
}

function contentLoadFailure(mode: Game["mode"], output: string) {
  const diagnostics =
    mode === "mame"
      ? /(?:game|roms?)\s+(?:not found|missing|not supported)|unable to find game|failed to (?:load|process) (?:content|rom)|no games? found|incorrect checksum|required files are missing|readroms failed|--help for more information|unknown (?:option|argument)|unrecognized option/i
      : /unsupported (?:mapper|board)|unknown mapper|invalid (?:rom|image)|failed to (?:load|process) (?:content|rom)|not a valid (?:rom|image)|--help for more information|unknown (?:option|argument)|unrecognized option/i;

  return diagnostics.test(output) ? output : undefined;
}

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

function stopRuntime(runtime: any, core: string) {
  if (typeof runtime?.quit !== "function") {
    return;
  }

  try {
    runtime.quit(0);
  } catch (error) {
    console.error(`Could not stop ${coreLabel(core)} runtime`, error);
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
        const contentPath = `${CONTENT_ROOT}/${selectedGame.file}`;
        setReady(false);
        setPlayerStatus(`fetching ${selectedGame.file}`);
        const romResponse = await fetch(selectedGame.path);
        if (!romResponse.ok) {
          throw new Error(`failed to fetch ${selectedGame.file}`);
        }

        const romData = new Uint8Array(await romResponse.arrayBuffer());
        if (cancelled) {
          return;
        }
        setPlayerStatus(`staged ${selectedGame.file} (${Math.max(1, Math.round(romData.byteLength / 1024))} KB)`);

        const cores = typeof core === "string" ? [core] : core;
        const failures: string[] = [];

        for (let coreIndex = 0; coreIndex < cores.length; coreIndex += 1) {
          const currentCore = cores[coreIndex];
          let loadFailure: string | undefined;
          const captureOutput = (line: string) => {
            loadFailure ??= contentLoadFailure(mode, line);
          };
          let emulator: any = null;

          if (cancelled) {
            return;
          }

          if (coreIndex > 0) {
            setPlayerStatus(`retrying ${label} with ${coreLabel(currentCore)}`);
          } else {
            setPlayerStatus(`loading ${coreLabel(currentCore)}`);
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(container.clientWidth, 640);
          canvas.height = Math.max(container.clientHeight, 480);
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.display = "block";
          container.replaceChildren(canvas);

          const Module = {
            noInitialRun: true,
            canvas,
            arguments: ["-v", contentPath],
            locateFile: (path: string) => `${PUBLIC_CORE_PATH}/${path}`,
            print: captureOutput,
            printErr: captureOutput,
            onRuntimeInitialized: () => {
              if (!cancelled) {
                setPlayerStatus(`${coreLabel(currentCore)} engine booted`);
              }
            },
          };

          try {
            const createCore = await loadCore(currentCore);
            setPlayerStatus(`initializing ${coreLabel(currentCore)}`);
            emulator = await createCore(Module);

            if (cancelled) {
              stopRuntime(emulator, currentCore);
              return;
            }

            moduleInstance.current = emulator;
            if (!emulator?.FS) {
              throw new Error(`${coreLabel(currentCore)} filesystem unavailable`);
            }

            for (const folder of ["/home", "/home/web_user", "/home/web_user/retroarch", "/home/web_user/retroarch/userdata", CONTENT_ROOT]) {
              ensureDirectory(emulator.FS, folder);
            }

            if (emulator.FS.analyzePath(contentPath).exists) {
              emulator.FS.unlink(contentPath);
            }

            emulator.FS.createDataFile(CONTENT_ROOT, selectedGame.file, romData, true, true);

            if (typeof emulator.callMain !== "function") {
              throw new Error(`${coreLabel(currentCore)} runtime entry point unavailable`);
            }
            setPlayerStatus(`starting ${selectedGame.title}`);
            emulator.callMain(Module.arguments);

            await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
            if (cancelled) {
              return;
            }

            if (loadFailure) {
              throw new Error(`${coreLabel(currentCore)} could not load ${selectedGame.file}: ${loadFailure}`);
            }

            setReady(true);
            setPlayerStatus("live");
            setNotice(`${selectedGame.title} inserted (${coreLabel(currentCore)})`);
            return;
          } catch (error) {
            if (moduleInstance.current === emulator) {
              moduleInstance.current = null;
              stopRuntime(emulator, currentCore);
            } else if (!cancelled) {
              stopRuntime(emulator, currentCore);
            }

            if (cancelled) {
              return;
            }

            const errorMessage = error instanceof Error ? error.message : String(error);
            failures.push(`${coreLabel(currentCore)}: ${errorMessage}`);
            if (coreIndex === cores.length - 1) {
              throw new Error(failures.join("; "));
            }

            setPlayerStatus(`${coreLabel(currentCore)} failed; trying another core`);
            console.warn(`${coreLabel(currentCore)} could not load ${selectedGame.file}; trying another core.`);
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setPlayerStatus(`${label} runtime error: ${error instanceof Error ? error.message : String(error)}`);
        setNotice(`${label.toUpperCase()} could not load this rom`);
      }
    };

    void boot();

    return () => {
      cancelled = true;
      const runtime = moduleInstance.current;
      moduleInstance.current = null;
      stopRuntime(runtime, label);
      mount.replaceChildren();
    };
  }, [core, label, mode, mountRef, reloadToken, selectedGame, setNotice]);

  return {
    playerStatus,
    ready,
    setPlayerStatus,
    setReady,
  };
}
