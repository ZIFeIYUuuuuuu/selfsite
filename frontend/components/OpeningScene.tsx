"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./OpeningScene.module.css";

// The opening is a personal film. Playback, pointer reveal and page scroll
// are deliberately independent; no photo changes are driven by the pointer.
const frames = [
  { src: "/about/details/avatar.jpg", label: "子非鱼", ratio: 0.998 },
  { src: "/about/details/dream-place.jpg", label: "想去的地方", ratio: 1.695 },
  { src: "/about/details/animal-cat.jpg", label: "生活里的小事", ratio: 1.335 },
  { src: "/about/details/style-room.jpg", label: "我的日常", ratio: 1.501 },
  { src: "/about/details/weather-snow.jpg", label: "喜欢的天气", ratio: 1.777 },
] as const;

export default function OpeningScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const captionRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [quiet, setQuiet] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const context = canvas.getContext("2d");
    const mask = document.createElement("canvas");
    const ink = mask.getContext("2d");
    // The first image and ordinary HTML caption remain visible if graphics fail.
    if (!context || !ink) return;
    const ctx = context;
    const brush = ink;
    let stopped = false;
    let raf = 0;
    let w = 1, h = 1, dpr = 1;
    let current = 0;
    let next = -1;
    let transitionStart = 0;
    let nextAt = performance.now() + 6500;
    let lastFrame = 0;
    let lastMove = -10000;
    let previous: { x: number; y: number; t: number } | null = null;
    let inViewport = true;
    let visible = true;

    const reset = () => {
      const rect = root.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const layer of [canvas, mask]) {
        layer.width = Math.max(1, Math.round(w * dpr));
        layer.height = Math.max(1, Math.round(h * dpr));
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      brush.setTransform(dpr, 0, 0, dpr, 0, 0);
      previous = null;
      ctx.fillStyle = "rgba(248,249,248,.86)";
      ctx.fillRect(0, 0, w, h);
      requestFrame();
    };

    const reveal = (event: PointerEvent) => {
      if (motion.matches || !visible || event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      const now = performance.now();
      // After a gap, start a fresh stroke instead of joining unrelated gestures.
      const from = previous && now - previous.t < 100 ? previous : { x: x - 1, y, t: now - 16 };
      const dx = x - from.x, dy = y - from.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.5) return;
      const speed = Math.min(2.2, distance / Math.max(8, now - from.t));
      const angle = Math.atan2(dy, dx);
      const radius = 25 + speed * 12;
      const tail = 12 + speed * 28;
      // Soft asymmetric ribbon, with irregular edges. Draw the entire pointer
      // segment immediately, so fast gestures never produce spaced stamps.
      brush.save();
      brush.translate(from.x, from.y);
      brush.rotate(angle);
      brush.globalCompositeOperation = "source-over";
      brush.filter = "blur(9px)";
      brush.fillStyle = "rgba(255,255,255,.86)";
      brush.beginPath();
      const length = distance + tail;
      for (let side = 0; side < 2; side++) {
        for (let j = 0; j <= 16; j++) {
          const u = side === 0 ? j / 16 : 1 - j / 16;
          const envelope = Math.pow(Math.sin(Math.PI * u), 0.62);
          const ripple = 1 + .16 * Math.sin(u * 19 + x * .018) + .1 * Math.sin(u * 37 + y * .025);
          const px = -tail + u * length;
          const py = (side === 0 ? -1 : 1) * radius * envelope * ripple * (side === 0 ? .9 : 1.12);
          if (side === 0 && j === 0) brush.moveTo(px, py); else brush.lineTo(px, py);
        }
      }
      brush.closePath(); brush.fill(); brush.restore();
      previous = { x, y, t: now };
      lastMove = now;
      requestFrame();
    };
    const leave = () => { previous = null; };

    const updateMotion = () => {
      setQuiet(motion.matches);
      canvas.style.display = motion.matches ? "none" : "block";
      brush.clearRect(0, 0, w, h);
      lastMove = -10000;
      previous = null;
      nextAt = performance.now() + 6500;
      if (motion.matches) {
        current = 0; next = -1;
        imagesRef.current.forEach((image, index) => {
          if (image) { image.style.opacity = index === 0 ? "1" : "0"; image.style.transform = "none"; }
        });
        if (captionRef.current) captionRef.current.textContent = frames[0].label;
        if (countRef.current) countRef.current.textContent = "01";
      }
      requestFrame();
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else { lastFrame = 0; nextAt = performance.now() + 6500; requestFrame(); }
    };
    const scroll = () => {
      const stage = root.closest("[data-home-stage]");
      const progress = Number((stage as HTMLElement | null)?.style.getPropertyValue("--stage-progress") || 0);
      visible = progress < .405;
      requestFrame();
    };
    function requestFrame() {
      if (!raf && !stopped && inViewport && !document.hidden) raf = requestAnimationFrame(render);
    }
    function render(now: number) {
      raf = 0;
      if (stopped) return;
      const dt = lastFrame ? Math.min(64, now - lastFrame) : 16;
      lastFrame = now;
      if (motion.matches || !visible) return;

      // Wait until the next image is decoded. Network load never advances the film.
      if (next < 0 && now >= nextAt && now - lastMove > 1400) {
        const index = (current + 1) % frames.length;
        const image = imagesRef.current[index];
        if (image?.complete && image.naturalWidth > 0) { next = index; transitionStart = now; }
      }
      if (next >= 0) {
        const t = Math.min(1, (now - transitionStart) / 1250);
        const ease = t * t * (3 - 2 * t);
        imagesRef.current.forEach((image, index) => {
          if (!image) return;
          image.style.opacity = index === current ? String(1 - ease) : index === next ? String(ease) : "0";
          image.style.transform = `translateY(${index === next ? (1 - ease) * 10 : -ease * 5}px) scale(${index === next ? 1.015 - ease * .015 : 1})`;
        });
        if (t >= 1) {
          current = next; next = -1; nextAt = now + 6500;
          if (captionRef.current) captionRef.current.textContent = frames[current].label;
          if (countRef.current) countRef.current.textContent = String(current + 1).padStart(2, "0");
        }
      }
      // Stop injecting when the pointer stops. After 1.5 seconds, existing reveal
      // fades by elapsed time, independent of display frame rate (~4 seconds).
      if (now - lastMove > 1500) {
        brush.save();
        brush.globalCompositeOperation = "destination-out";
        brush.fillStyle = `rgba(0,0,0,${1 - Math.exp(-dt / 1200)})`;
        brush.fillRect(0, 0, w, h); brush.restore();
      }
      ctx.clearRect(0, 0, w, h);
      const fog = ctx.createLinearGradient(0, 0, w, h);
      const breath = Math.sin(now / 6000) * .008;
      fog.addColorStop(0, `rgba(248,249,248,${.89 + breath})`);
      fog.addColorStop(.5, `rgba(248,249,248,${.81 + breath})`);
      fog.addColorStop(1, `rgba(248,249,248,${.9 + breath})`);
      ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(mask, 0, 0, w, h); ctx.restore();
      requestFrame();
    }
    const resizeObserver = new ResizeObserver(reset);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      if (!inViewport) { cancelAnimationFrame(raf); raf = 0; }
      else { lastFrame = 0; requestFrame(); }
    });
    resizeObserver.observe(root); intersectionObserver.observe(root);
    root.addEventListener("pointermove", reveal, { passive: true });
    root.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", updateMotion);
    reset(); updateMotion();
    return () => {
      stopped = true; cancelAnimationFrame(raf);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      root.removeEventListener("pointermove", reveal); root.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  return (
    <div className={`${styles.opening} ${quiet ? styles.quiet : ""}`}>
      <div className={styles.film} ref={rootRef} aria-label="雾中的生活影像">
        <div className={styles.frame}>
          {frames.map((frame, index) => (
            <Image unoptimized ref={(element) => { imagesRef.current[index] = element; }} key={frame.src}
              src={frame.src} alt={index === 0 ? "子非鱼的生活影像：肖像、猫、房间与风景" : ""}
              aria-hidden={index > 0 ? true : undefined} width={Math.round(frame.ratio * 600)} height={600}
              draggable={false} loading="eager" decoding="async" style={{ opacity: index === 0 ? 1 : 0 }} />
          ))}
        </div>
        <canvas ref={canvasRef} className={styles.fog} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
      <div className={styles.caption}>
        <span className={styles.captionLabel}>LIFE, IN FRAGMENTS</span>
        <span ref={captionRef}>{frames[0].label}</span>
        <span className={styles.counter}><span ref={countRef}>01</span><i />{String(frames.length).padStart(2, "0")}</span>
      </div>
      <span className={styles.exploreHint}>{quiet ? "生活的几个片段" : "移动鼠标，让影像浮现"}</span>
    </div>
  );
}
