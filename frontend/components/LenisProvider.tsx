"use client";

import { useEffect } from "react";

import Lenis from "lenis";

declare global {
  interface Window {
    __zfyLenis?: Lenis;
  }
}

export default function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false
    });
    window.__zfyLenis = lenis;

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      delete window.__zfyLenis;
      lenis.destroy();
    };
  }, []);

  return null;
}

