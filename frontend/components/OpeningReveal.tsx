"use client";

import Image from "next/image";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { createFluidReveal } from "@/lib/fluid-reveal";
import { useEffect, useRef } from "react";
import { useSiteMode } from "./ThemeProvider";
import styles from "./ReferenceHome.module.css";

type OpeningFrame = { src: string; alt: string; fit?: "cover" | "contain" };

const lifeFrames: readonly OpeningFrame[] = [
  { src: "/about/details/avatar.jpg", alt: "子非鱼的头像" },
  { src: "/about/details/animal-cat.jpg", alt: "生活里的猫" },
  { src: "/about/details/style-room.jpg", alt: "工作与生活的空间" },
  { src: "/about/details/dream-place.jpg", alt: "想去的地方" },
  { src: "/gallery/autumn-window.webp", alt: "窗外的秋树、栏杆与一把红色椅子" },
  { src: "/gallery/game-reward.webp", alt: "游戏奖励页面中的一排收藏品" },
  { src: "/gallery/gym-floor.webp", alt: "健身房里的杠铃片、器械和鞋子" },
  { src: "/gallery/manga-store.webp", alt: "漫画书店里挂满插画的墙面与陈列架" },
  { src: "/gallery/illustration-book.webp", alt: "樱花树下人物插画的书籍封面", fit: "contain" },
  { src: "/gallery/pizza.webp", alt: "桌上的双拼披萨" },
];

const workFrames: readonly OpeningFrame[] = [
  { src: "/work/moyag-agent-canvas.jpg", alt: "MOYAG Agent Canvas 首页：提示词输入、无限画布与编辑入口", fit: "contain" },
  { src: "/work/claimcourt-clean.png", alt: "ClaimCourt 本地证据智能体工作台", fit: "contain" },
  { src: "/work/super-agent-ui.jpg", alt: "Super Agent 工作台界面：对话、检索和工具流程", fit: "contain" },
  { src: "/work/interviewpilot-ai.png", alt: "InterviewPilot AI 求职训练工作台", fit: "contain" },
];

export default function OpeningReveal() {
  const { mode } = useSiteMode();
  const frames = mode === "work" ? workFrames : lifeFrames;
  const areaRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const track = trackRef.current;
    if (!area || !track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-frame-index]"));
    const states = cards.map(() => ({ progress: 0 }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    gsap.registerPlugin(CustomEase);
    CustomEase.create("zfy-orbit", "0.625,0.05,0,1");
    gsap.set(track, { xPercent: -50, yPercent: -50 });
    let running = false;
    let step: gsap.core.Timeline | null = null;
    const rotations = gsap.timeline({ repeat: -1, paused: true })
      .to(track, { rotation: 360, duration: 24, ease: "none" }, 0)
      .to(cards, { rotation: -360, duration: 24, ease: "none" }, 0);
    const render = () => {
      const width = cards[0]?.offsetWidth || 1;
      cards.forEach((card, index) => {
        const angle = (index - states[index].progress) / cards.length * Math.PI * 2;
        const depth = Math.pow((Math.cos(angle) + 1) / 2, 1.3);
        gsap.set(card, {
          x: Math.sin(angle) * width,
          scale: .2 + .8 * depth,
          zIndex: Math.round(depth * 1000),
          filter: `blur(${width * .04 * (1 - depth)}px) brightness(${.3 + .7 * depth})`,
        });
      });
    };
    const advance = () => {
      const distance = (index: number) => {
        const wrapped = ((index - states[index].progress) % cards.length + cards.length) % cards.length;
        return Math.min(wrapped, cards.length - wrapped);
      };
      let front = 0;
      cards.forEach((_, index) => { if (distance(index) < distance(front)) front = index; });
      step = gsap.timeline({ onComplete: () => { step = null; if (running) advance(); } });
      cards.map((_, index) => ({ index, order: (index - front + cards.length) % cards.length }))
        .sort((a, b) => a.order - b.order)
        .forEach(({ index }, order) => {
          step!.to(states[index], { progress: states[index].progress + 1, duration: 2.5, ease: "zfy-orbit", onUpdate: render }, order * .075);
        });
    };
    const play = () => {
      if (running || reduced.matches || document.hidden) return;
      running = true;
      rotations.play();
      if (step) step.play(); else advance();
    };
    const pause = () => { running = false; rotations.pause(); step?.pause(); };
    let visible = false;
    const sync = () => { if (visible && !document.hidden) play(); else pause(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(area);
    const resize = new ResizeObserver(render);
    resize.observe(track);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    render();
    return () => {
      pause(); step?.kill(); rotations.kill();
      observer.disconnect(); resize.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      gsap.set([track, ...cards], { clearProps: "transform,filter,zIndex" });
    };
  }, [frames]);

  useEffect(() => {
    const area = areaRef.current;
    const canvas = canvasRef.current;
    const fallback = fallbackRef.current;
    if (!area || !canvas || !fallback) return;
    fallback.style.display = "block";
    let fluid: ReturnType<typeof createFluidReveal> = null;
    try { fluid = createFluidReveal(canvas); } catch (error) { console.warn("Fluid reveal fallback:", error); }
    let fallbackCanvas: HTMLCanvasElement | null = null;
    let context: CanvasRenderingContext2D | null = null;
    const strokes: { x: number; y: number; born: number }[] = [];
    if (!fluid) {
      canvas.style.display = "none";
      fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.style.cssText = "display:block;width:100%;height:100%";
      fallback.appendChild(fallbackCanvas);
      context = fallbackCanvas.getContext("2d");
    } else canvas.style.display = "block";
    let width = 1;
    let height = 1;
    let color = "#fff";
    let frame = 0;
    let visible = true;
    let introOpened = document.documentElement.dataset.zfyIntroSkip === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let previous: { x: number; y: number; time: number } | null = null;
    const draw = (now: number) => {
      if (fluid) fluid.draw(now);
      else if (context) {
        context.globalCompositeOperation = "source-over";
        context.fillStyle = color;
        context.fillRect(0, 0, width, height);
        context.save();
        context.globalCompositeOperation = "destination-out";
        for (let i = strokes.length - 1; i >= 0; i--) {
          const stroke = strokes[i];
          const age = (now - stroke.born) / 2600;
          if (age >= 1) { strokes.splice(i, 1); continue; }
          const radius = height * .088 * (1 - age * .4);
          const gradient = context.createRadialGradient(stroke.x, stroke.y, 0, stroke.x, stroke.y, radius);
          gradient.addColorStop(0, `rgba(0,0,0,${1 - age})`);
          gradient.addColorStop(.72, `rgba(0,0,0,${1 - age})`);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = gradient;
          context.fillRect(stroke.x-radius, stroke.y-radius, radius*2, radius*2);
        }
        context.restore();
      }
    };
    const syncColor = () => {
      color = getComputedStyle(area).color;
      const channels = color.match(/[\d.]+/g);
      if (channels && channels.length >= 3) fluid?.color([Number(channels[0])/255, Number(channels[1])/255, Number(channels[2])/255]);
      draw(performance.now());
    };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
    const render = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || !introOpened) return;
      draw(now);
      frame = requestAnimationFrame(render);
    };
    const start = () => { if (!frame && visible && !document.hidden && introOpened) frame = requestAnimationFrame(render); };
    const resize = () => {
      const bounds = area.getBoundingClientRect();
      width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      previous = null;
      fluid?.resize(width, height);
      if (fallbackCanvas) { fallbackCanvas.width = width; fallbackCanvas.height = height; }
      syncColor();
      if (fluid) fallback.style.display = "none";
      else fallback.style.background = "transparent";
      start();
    };
    const move = (event: PointerEvent) => {
      const bounds = area.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / width;
      const y = 1 - (event.clientY - bounds.top) / height;
      if (x < 0 || x > 1 || y < 0 || y > 1 || !introOpened || (event.pointerType === "touch" && !event.buttons)) { previous = null; return; }
      const now = performance.now();
      const from = previous && now - previous.time < 150 ? previous : { x, y, time: now - 16 };
      const elapsed = Math.max(.004, (now - from.time) / 1000);
      fluid?.stroke({ from, to: { x, y }, velocity: { x: (x-from.x)/elapsed, y: (y-from.y)/elapsed } });
      if (!fluid) {
        const count = Math.max(1, Math.ceil(Math.hypot((x-from.x)*width, (y-from.y)*height) / 12));
        for (let i = 1; i <= count; i++) strokes.push({ x: (from.x+(x-from.x)*i/count)*width, y: (1-from.y-(y-from.y)*i/count)*height, born: now });
        if (strokes.length > 240) strokes.splice(0, strokes.length - 240);
      }
      previous = { x, y, time: now };
      start();
    };
    const leave = () => { previous = null; };
    const opening = () => { introOpened = true; start(); };
    const visibility = () => { if (document.hidden) stop(); else start(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else { stop(); previous = null; fluid?.clear(); strokes.length = 0; }
    });
    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(syncColor);
    observer.observe(area); resizeObserver.observe(area);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("zfy:intro-opening", opening);
    window.addEventListener("zfy:intro-complete", opening);
    resize();
    return () => {
      stop(); observer.disconnect(); resizeObserver.disconnect(); themeObserver.disconnect();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", move);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("zfy:intro-opening", opening);
      window.removeEventListener("zfy:intro-complete", opening);
      fluid?.destroy(); fallbackCanvas?.remove();
    };
  }, [frames]);

  return <div ref={areaRef} className={styles.revealSurface} aria-hidden="true">
    <div className={styles.orbit}>
      <div ref={trackRef} className={styles.orbitTrack}>
        {frames.map((frame, index) => <div className={styles.orbitCard} key={frame.src} data-frame-index={index}>
          <div className={styles.orbitCardFrame}>
            <Image unoptimized src={frame.src} alt={frame.alt} width={1200} height={900} priority={index < 4} draggable={false} style={{ objectFit: frame.fit ?? "cover" }} />
          </div>
        </div>)}
      </div>
    </div>
    <div ref={fallbackRef} className={styles.revealFallback}/>
    <canvas ref={canvasRef} className={styles.revealCanvas}/>
  </div>;
}
