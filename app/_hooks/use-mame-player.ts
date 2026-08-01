"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Game } from "../_lib/types";

type UseMamePlayerOptions = {
  mountRef: RefObject<HTMLDivElement | null>;
  reloadToken: number;
  selectedGame?: Game;
  setNotice: (notice: string) => void;
};

const MAME_CORE = "mame2003";
const PUBLIC_CORE_PATH = "/emulators/retroarch";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src=\"${src}\"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function useMamePlayer({ mountRef, reloadToken, selectedGame, setNotice }: UseMamePlayerOptions) {
  const [playerStatus, setPlayerStatus] = useState("waiting for game");
  const [mameReady, setMameReady] = useState(false);
  const moduleInstance = useRef<any>(null);

  useEffect(() => {
    if (!selectedGame || selectedGame.mode !== "mame") {
      if (moduleInstance.current && moduleInstance.current.requestFullscreen) {
        moduleInstance.current.requestFullscreen(false);
      }
      moduleInstance.current = null;
      setPlayerStatus("waiting for game");
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

    const loadMame = async () => {
      try {
        setPlayerStatus("loading mame engine");

        await loadScript(`${PUBLIC_CORE_PATH}/browserfs.min.js`);

        const remotePath = new URL(`${PUBLIC_CORE_PATH}/${MAME_CORE}_libretro.js`, window.location.href).href;
        const dynamicImport = new Function("url", "return import(url);");
        const coreScript = await dynamicImport(remotePath);

        if (!coreScript || typeof coreScript.default !== "function") {
          throw new Error("MAME core script unavailable");
        }

        const gameFsPath = `/home/web_user/retroarch/userdata/content/${selectedGame.file}`;
        const Module = {
          noInitialRun: true,
          canvas: document.createElement("canvas"),
          arguments: ["-v", "--load-content", gameFsPath],
          locateFile: (path: string) => `${PUBLIC_CORE_PATH}/${path}`,
          print: console.log,
          printErr: console.error,
          onRuntimeInitialized: () => {
            if (!cancelled) {
              setPlayerStatus("engine booted");
            }
          },
        };

        Module.canvas.width = container.clientWidth;
        Module.canvas.height = container.clientHeight;
        Module.canvas.style.width = "100%";
        Module.canvas.style.height = "100%";
        container.appendChild(Module.canvas);

        const mameModule = await coreScript.default(Module);
        moduleInstance.current = mameModule;
        setMameReady(true);

        if (cancelled) {
          return;
        }

        const romResponse = await fetch(selectedGame.path);
        if (!romResponse.ok) {
          throw new Error("failed to fetch mame rom");
        }

        const romData = new Uint8Array(await romResponse.arrayBuffer());

        if (mameModule.FS) {
          try {
            for (const folder of [
              "/home",
              "/home/web_user",
              "/home/web_user/retroarch",
              "/home/web_user/retroarch/userdata",
              "/home/web_user/retroarch/userdata/content",
            ]) {
              if (!mameModule.FS.analyzePath(folder).exists) {
                mameModule.FS.mkdir(folder);
              }
            }
          } catch {
            // ignore directory creation errors
          }

          if (typeof mameModule.FS.createDataFile === "function") {
            mameModule.FS.createDataFile(
              "/home/web_user/retroarch/userdata/content",
              selectedGame.file,
              romData,
              true,
              true,
            );
          }
        }

        if (typeof mameModule.callMain === "function") {
          mameModule.callMain(mameModule.arguments);
        }

        setPlayerStatus("live");
        setNotice(`${selectedGame.title} inserted`);
      } catch (error) {
        console.error(error);
        setPlayerStatus("mame runtime error");
        setNotice("MAME could not load this rom");
      }
    };

    void loadMame();

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
  }, [mountRef, reloadToken, selectedGame, setNotice]);

  return {
    mameReady,
    playerStatus,
    setPlayerStatus,
    setMameReady,
  };
}
