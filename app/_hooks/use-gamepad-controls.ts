"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameMode } from "../_lib/types";
import type { RefObject } from "react";

export type ControllerBinding = {
  id: string;
  label: string;
  keyboardCode: string;
  gamepadButton: number;
};

const GAMEPAD_MAPPINGS_KEY = "flashback-machine:controller-mappings";
const forwardedKeyboardEvents = new WeakSet<KeyboardEvent>();

function createDefaultMappings(): Record<GameMode, ControllerBinding[]> {
  const directions = [
    { id: "up", label: "up", keyboardCode: "ArrowUp", gamepadButton: 12 },
    { id: "down", label: "down", keyboardCode: "ArrowDown", gamepadButton: 13 },
    { id: "left", label: "left", keyboardCode: "ArrowLeft", gamepadButton: 14 },
    { id: "right", label: "right", keyboardCode: "ArrowRight", gamepadButton: 15 },
  ];

  return {
    flash: [
      ...directions,
      { id: "primary", label: "primary", keyboardCode: "Space", gamepadButton: 0 },
      { id: "secondary", label: "secondary", keyboardCode: "Enter", gamepadButton: 1 },
      { id: "pause", label: "pause", keyboardCode: "Escape", gamepadButton: 9 },
    ],
    gba: [
      ...directions,
      { id: "a", label: "A", keyboardCode: "KeyZ", gamepadButton: 0 },
      { id: "b", label: "B", keyboardCode: "KeyX", gamepadButton: 1 },
      { id: "l", label: "L", keyboardCode: "KeyA", gamepadButton: 4 },
      { id: "r", label: "R", keyboardCode: "KeyS", gamepadButton: 5 },
      { id: "select", label: "select", keyboardCode: "ShiftRight", gamepadButton: 8 },
      { id: "start", label: "start", keyboardCode: "Enter", gamepadButton: 9 },
    ],
    jsdos: [
      ...directions,
      { id: "primary", label: "primary", keyboardCode: "ControlLeft", gamepadButton: 0 },
      { id: "secondary", label: "secondary", keyboardCode: "AltLeft", gamepadButton: 1 },
      { id: "action", label: "action", keyboardCode: "Space", gamepadButton: 2 },
      { id: "enter", label: "enter", keyboardCode: "Enter", gamepadButton: 9 },
      { id: "escape", label: "escape", keyboardCode: "Escape", gamepadButton: 8 },
    ],
    mame: [
      ...directions,
      { id: "button1", label: "button 1", keyboardCode: "KeyZ", gamepadButton: 0 },
      { id: "button2", label: "button 2", keyboardCode: "KeyX", gamepadButton: 1 },
      { id: "button3", label: "button 3", keyboardCode: "KeyA", gamepadButton: 2 },
      { id: "button4", label: "button 4", keyboardCode: "KeyS", gamepadButton: 3 },
      { id: "coin", label: "coin", keyboardCode: "ShiftRight", gamepadButton: 8 },
      { id: "start", label: "start", keyboardCode: "Enter", gamepadButton: 9 },
    ],
    nes: [
      ...directions,
      { id: "a", label: "A", keyboardCode: "KeyX", gamepadButton: 0 },
      { id: "b", label: "B", keyboardCode: "KeyZ", gamepadButton: 1 },
      { id: "select", label: "select", keyboardCode: "ShiftRight", gamepadButton: 8 },
      { id: "start", label: "start", keyboardCode: "Enter", gamepadButton: 9 },
    ],
    ps2: [
      ...directions,
      { id: "cross", label: "cross", keyboardCode: "KeyZ", gamepadButton: 0 },
      { id: "circle", label: "circle", keyboardCode: "KeyX", gamepadButton: 1 },
      { id: "square", label: "square", keyboardCode: "KeyA", gamepadButton: 2 },
      { id: "triangle", label: "triangle", keyboardCode: "KeyS", gamepadButton: 3 },
      { id: "l1", label: "L1", keyboardCode: "KeyQ", gamepadButton: 4 },
      { id: "r1", label: "R1", keyboardCode: "KeyW", gamepadButton: 5 },
      { id: "l2", label: "L2", keyboardCode: "KeyE", gamepadButton: 6 },
      { id: "r2", label: "R2", keyboardCode: "KeyR", gamepadButton: 7 },
      { id: "select", label: "select", keyboardCode: "ShiftRight", gamepadButton: 8 },
      { id: "start", label: "start", keyboardCode: "Enter", gamepadButton: 9 },
    ],
    sega: [
      ...directions,
      { id: "a", label: "A", keyboardCode: "KeyA", gamepadButton: 0 },
      { id: "b", label: "B", keyboardCode: "KeyS", gamepadButton: 1 },
      { id: "c", label: "C", keyboardCode: "KeyD", gamepadButton: 2 },
      { id: "start", label: "start", keyboardCode: "Enter", gamepadButton: 9 },
    ],
    pcengine: [
      ...directions,
      { id: "button1", label: "I", keyboardCode: "KeyZ", gamepadButton: 0 },
      { id: "button2", label: "II", keyboardCode: "KeyX", gamepadButton: 1 },
      { id: "select", label: "select", keyboardCode: "ShiftRight", gamepadButton: 8 },
      { id: "run", label: "run", keyboardCode: "Enter", gamepadButton: 9 },
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function keyFromCode(code: string) {
  if (code.startsWith("Key")) {
    return code.slice(3).toLowerCase();
  }
  if (code.startsWith("Digit")) {
    return code.slice(5);
  }
  if (code === "Space") {
    return " ";
  }
  if (code === "ShiftLeft" || code === "ShiftRight") {
    return "Shift";
  }
  if (code === "ControlLeft" || code === "ControlRight") {
    return "Control";
  }
  if (code === "AltLeft" || code === "AltRight") {
    return "Alt";
  }

  return code;
}

function legacyKeyCode(code: string) {
  const specialKeys: Record<string, number> = {
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    ArrowUp: 38,
    Backspace: 8,
    ControlLeft: 17,
    ControlRight: 17,
    Enter: 13,
    Escape: 27,
    NumpadEnter: 13,
    ShiftLeft: 16,
    ShiftRight: 16,
    Space: 32,
    Tab: 9,
  };

  if (specialKeys[code] !== undefined) {
    return specialKeys[code];
  }
  if (code.startsWith("Key")) {
    return code.charCodeAt(3);
  }
  if (code.startsWith("Digit")) {
    return code.charCodeAt(5);
  }

  return 0;
}

function getInputTarget(mount: HTMLDivElement | null) {
  if (!mount) {
    return null;
  }

  const target =
    mount.querySelector<HTMLElement>("canvas") ??
    mount.querySelector<HTMLElement>("ruffle-player") ??
    mount.querySelector("iframe")?.contentDocument?.querySelector<HTMLElement>("canvas, [tabindex]") ??
    mount.querySelector("iframe") ??
    mount.querySelector<HTMLElement>("[tabindex]") ??
    mount;
  if (target.tabIndex < 0) {
    target.tabIndex = 0;
  }

  return target;
}

function isEditingText() {
  const focusedElement = document.activeElement;
  return (
    focusedElement instanceof HTMLElement &&
    (focusedElement.isContentEditable || focusedElement.matches("input, select, textarea"))
  );
}

function dispatchKey(type: "keydown" | "keyup", code: string, target: HTMLElement | null) {
  if (!target) {
    return;
  }

  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    code,
    composed: true,
    key: keyFromCode(code),
  });
  const keyCode = legacyKeyCode(code);

  Object.defineProperty(event, "keyCode", { get: () => keyCode });
  Object.defineProperty(event, "which", { get: () => keyCode });
  forwardedKeyboardEvents.add(event);
  event.preventDefault();

  target.dispatchEvent(event);
}

function buttonLabel(index: number) {
  const labels = ["A / Cross", "B / Circle", "X / Square", "Y / Triangle", "LB / L1", "RB / R1", "LT / L2", "RT / R2", "View / Select", "Menu / Start", "Left stick", "Right stick", "D-pad up", "D-pad down", "D-pad left", "D-pad right"];

  return labels[index] ?? `button ${index + 1}`;
}

export function useGamepadControls(mode: GameMode, enabled: boolean, mountRef: RefObject<HTMLDivElement | null>) {
  const [mappings, setMappings] = useState<Record<GameMode, ControllerBinding[]>>(createDefaultMappings);
  const [storageReady, setStorageReady] = useState(false);
  const [controllerStatus, setControllerStatus] = useState("checking gamepads");
  const [captureAction, setCaptureAction] = useState<string | null>(null);
  const [activeControlIds, setActiveControlIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const serialized = window.localStorage.getItem(GAMEPAD_MAPPINGS_KEY);
      if (serialized) {
        const saved: unknown = JSON.parse(serialized);
        if (!isRecord(saved)) {
          throw new Error("Saved controller mappings must be an object");
        }

        setMappings((defaults) => {
          const next = { ...defaults };
          for (const system of Object.keys(defaults) as GameMode[]) {
            const savedSystem = saved[system];
            if (!isRecord(savedSystem)) {
              continue;
            }

            next[system] = defaults[system].map((binding) => {
              const savedBinding = savedSystem[binding.id];
              if (!isRecord(savedBinding)) {
                return binding;
              }

              const keyboardCode =
                typeof savedBinding.keyboardCode === "string" && savedBinding.keyboardCode.length <= 32
                  ? savedBinding.keyboardCode
                  : binding.keyboardCode;
              const gamepadButton =
                Number.isInteger(savedBinding.gamepadButton) &&
                typeof savedBinding.gamepadButton === "number" &&
                savedBinding.gamepadButton >= 0 &&
                savedBinding.gamepadButton <= 63
                  ? savedBinding.gamepadButton
                  : binding.gamepadButton;

              return { ...binding, keyboardCode, gamepadButton };
            });
          }

          return next;
        });
      }
    } catch (error) {
      console.error("Could not read saved controller mappings", error);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    try {
      const serializedMappings = Object.fromEntries(
        (Object.keys(mappings) as GameMode[]).map((system) => [
          system,
          Object.fromEntries(
            mappings[system].map((binding) => [
              binding.id,
              { keyboardCode: binding.keyboardCode, gamepadButton: binding.gamepadButton },
            ]),
          ),
        ]),
      );
      window.localStorage.setItem(GAMEPAD_MAPPINGS_KEY, JSON.stringify(serializedMappings));
    } catch (error) {
      console.error("Could not save controller mappings", error);
    }
  }, [mappings, storageReady]);

  const updateBinding = useCallback(
    (id: string, update: (binding: ControllerBinding) => ControllerBinding) => {
      setMappings((current) => ({
        ...current,
        [mode]: current[mode].map((binding) => (binding.id === id ? update(binding) : binding)),
      }));
    },
    [mode],
  );

  const setKeyboardMapping = useCallback(
    (id: string, keyboardCode: string) => {
      updateBinding(id, (binding) => ({ ...binding, keyboardCode }));
    },
    [updateBinding],
  );

  const startGamepadCapture = useCallback((id: string) => {
    setCaptureAction((current) => (current === id ? null : id));
  }, []);

  const resetMappings = useCallback(() => {
    setMappings((current) => ({
      ...current,
      [mode]: createDefaultMappings()[mode],
    }));
  }, [mode]);

  const activeMappings = mappings[mode];

  useEffect(() => {
    setCaptureAction(null);
  }, [mode]);

  useEffect(() => {
    let captureCompleted = false;
    let previousActiveSignature = "";
    const pressedKeys = new Set<string>();
    const pressedKeyboardCodes = new Set<string>();
    const forwardedPhysicalKeys = new Set<string>();

    const releaseKeys = () => {
      const target = getInputTarget(mountRef.current);
      new Set([...pressedKeys, ...forwardedPhysicalKeys]).forEach((code) => dispatchKey("keyup", code, target));
      pressedKeys.clear();
      forwardedPhysicalKeys.clear();
    };

    const trackKeyDown = (event: KeyboardEvent) => {
      if (forwardedKeyboardEvents.has(event)) {
        return;
      }

      pressedKeyboardCodes.add(event.code);
      if (
        !enabled ||
        captureAction ||
        isEditingText() ||
        document.activeElement?.closest(".control-map-button.is-capturing") ||
        !activeMappings.some((binding) => binding.keyboardCode === event.code)
      ) {
        return;
      }

      const target = getInputTarget(mountRef.current);
      if (!target) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      forwardedPhysicalKeys.add(event.code);
      target.focus({ preventScroll: true });
      if (!pressedKeys.has(event.code)) {
        dispatchKey("keydown", event.code, target);
      }
    };
    const trackKeyUp = (event: KeyboardEvent) => {
      if (forwardedKeyboardEvents.has(event)) {
        return;
      }

      pressedKeyboardCodes.delete(event.code);
      const shouldForward =
        forwardedPhysicalKeys.has(event.code) ||
        (enabled &&
          !captureAction &&
          !isEditingText() &&
          !document.activeElement?.closest(".control-map-button.is-capturing") &&
          activeMappings.some((binding) => binding.keyboardCode === event.code));
      if (!shouldForward) {
        return;
      }
      forwardedPhysicalKeys.delete(event.code);

      const target = getInputTarget(mountRef.current);
      if (!target) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      if (!pressedKeys.has(event.code)) {
        dispatchKey("keyup", event.code, target);
      }
    };

    const poll = () => {
      const pads = navigator.getGamepads?.();
      const gamepad = pads ? Array.from(pads).find((pad) => pad?.connected) : undefined;

      if (!navigator.getGamepads) {
        setControllerStatus((current) => (current === "Gamepad API unavailable" ? current : "Gamepad API unavailable"));
      } else {
        const status = gamepad
          ? `${gamepad.id || "Controller"}${gamepad.mapping === "standard" ? " (standard layout)" : " (custom layout)"}`
          : "no controller connected";
        setControllerStatus((current) => (current === status ? current : status));
      }

      if (captureAction && !captureCompleted && gamepad) {
        const pressedIndex = gamepad.buttons.findIndex((button) => button.pressed || button.value > 0.65);
        if (pressedIndex >= 0) {
          captureCompleted = true;
          updateBinding(captureAction, (binding) => ({ ...binding, gamepadButton: pressedIndex }));
          setCaptureAction(null);
        }
      }

      const nextPressedKeys = new Set<string>();
      const activeControls: string[] = [];
      const target = getInputTarget(mountRef.current);
      for (const binding of activeMappings) {
        const button = gamepad?.buttons[binding.gamepadButton];
        let gamepadPressed = Boolean(button && (button.pressed || button.value > 0.55));

        if (binding.id === "up") {
          gamepadPressed ||= (gamepad?.axes[1] ?? 0) < -0.55;
        } else if (binding.id === "down") {
          gamepadPressed ||= (gamepad?.axes[1] ?? 0) > 0.55;
        } else if (binding.id === "left") {
          gamepadPressed ||= (gamepad?.axes[0] ?? 0) < -0.55;
        } else if (binding.id === "right") {
          gamepadPressed ||= (gamepad?.axes[0] ?? 0) > 0.55;
        }

        if (pressedKeyboardCodes.has(binding.keyboardCode) || gamepadPressed) {
          activeControls.push(binding.id);
        }
        if (enabled && gamepadPressed && !captureAction) {
          nextPressedKeys.add(binding.keyboardCode);
        }
      }

      const activeSignature = activeControls.join("|");
      if (activeSignature !== previousActiveSignature) {
        previousActiveSignature = activeSignature;
        setActiveControlIds(activeControls);
      }

      pressedKeys.forEach((code) => {
        if (!nextPressedKeys.has(code)) {
          if (!forwardedPhysicalKeys.has(code)) {
            dispatchKey("keyup", code, target);
          }
          pressedKeys.delete(code);
        }
      });
      nextPressedKeys.forEach((code) => {
        if (!pressedKeys.has(code)) {
          if (!forwardedPhysicalKeys.has(code)) {
            if (enabled && target) {
              target.focus({ preventScroll: true });
            }
            dispatchKey("keydown", code, target);
          }
          pressedKeys.add(code);
        }
      });

    };

    window.addEventListener("keydown", trackKeyDown, true);
    window.addEventListener("keyup", trackKeyUp, true);
    poll();
    const interval = window.setInterval(poll, 32);
    window.addEventListener("gamepadconnected", poll);
    window.addEventListener("gamepaddisconnected", poll);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("gamepadconnected", poll);
      window.removeEventListener("gamepaddisconnected", poll);
      window.removeEventListener("keydown", trackKeyDown, true);
      window.removeEventListener("keyup", trackKeyUp, true);
      releaseKeys();
      setActiveControlIds([]);
    };
  }, [activeMappings, captureAction, enabled, mountRef, updateBinding]);

  return {
    activeMappings,
    activeControlIds,
    buttonLabel,
    capturingAction: captureAction,
    controllerStatus,
    resetMappings,
    setKeyboardMapping,
    startGamepadCapture,
  };
}
