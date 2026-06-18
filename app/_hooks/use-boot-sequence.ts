"use client";

import { useEffect, useState } from "react";

export function useBootSequence() {
  const [bootProgress, setBootProgress] = useState(0);
  const [bootReady, setBootReady] = useState(false);
  const [bootStarted, setBootStarted] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBootProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setBootReady(true), 520);

          return 100;
        }

        return Math.min(100, current + Math.floor(Math.random() * 13) + 5);
      });
    }, 180);

    return () => window.clearInterval(interval);
  }, []);

  return {
    bootProgress,
    bootReady,
    bootStarted,
    startBoot: () => setBootStarted(true),
  };
}
