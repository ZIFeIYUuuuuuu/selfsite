"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import styles from "./BrandIntro.module.css";

// Matching cap heights and stroke weights, with optical side bearings per glyph.
const GLYPHS = [
  { letter: "Z", path: "M50 24H239V58L98 232H239V266H50V232L191 58H50Z" },
  { letter: "F", path: "M61 24H239V58H99V126H222V160H99V266H61Z" },
  { letter: "Y", path: "M42 24H85L145 126L205 24H248L164 166V266H126V166Z" },
] as const;

const BEATS = { scene: 1.15, spread: 1.3, square: 2.1, rectangle: 2.4, full: 3.25 };

export default function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || root.dataset.zfyIntroSkip === "true") {
      setVisible(false);
      window.dispatchEvent(new Event("zfy:intro-opening"));
      window.dispatchEvent(new Event("zfy:intro-complete"));
      return;
    }

    const intro = introRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const wordmark = wordmarkRef.current;
    const letters = letterRefs.current.filter((letter): letter is HTMLDivElement => Boolean(letter));
    if (!intro || !svg || !path || !wordmark || letters.length !== GLYPHS.length) return;

    gsap.registerPlugin(CustomEase);
    const ease = CustomEase.create("zfy-parallax", "0.7, 0.05, 0.13, 1");
    const identity = document.querySelector<HTMLElement>("[data-home-identity]");
    const chrome = Array.from(document.querySelectorAll<HTMLElement>("[data-home-chrome]"));
    const home = document.getElementById("top");
    const wasInert = home?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    const smooth = window.__zfyLenis;
    const wasStopped = smooth?.isStopped ?? false;
    document.body.style.overflow = "hidden";
    if (home) home.inert = true;
    smooth?.stop();
    // A fresh homepage load always opens on the hero, including bookmarked hashes.
    if (smooth) smooth.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, behavior: "instant" });

    let finished = false;
    let sceneRevealed = false;
    let sceneTween: gsap.core.Tween | null = null;
    let chromeTween: gsap.core.Tween | null = null;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const mix = { square: 0, rectangle: 0, full: 0 };

    const revealScene = (immediate = false) => {
      if (sceneRevealed) {
        if (immediate) sceneTween?.progress(1);
        return;
      }
      sceneRevealed = true;
      if (identity) sceneTween = gsap.to(identity, {
        autoAlpha: 1, y: 0, duration: immediate ? 0 : .6, ease,
        onComplete: () => { gsap.set(identity, { clearProps: "opacity,visibility,transform" }); },
      });
    };
    const draw = () => {
      const { width, height } = viewport;
      const square = Math.max(32, Math.round(Math.min(width, height) * .14));
      const rectWidth = Math.min(width * .66, height * .66 * 1.5);
      const rectHeight = rectWidth / 1.5;
      const w = mix.square * square + mix.rectangle * rectWidth + mix.full * width;
      const h = mix.square * square + mix.rectangle * rectHeight + mix.full * height;
      const x = (width - w) / 2;
      const y = (height - h) / 2;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      path.setAttribute("d", `M0 0H${width}V${height}H0Z${w > 0 && h > 0 ? ` M${x} ${y}H${x + w}V${y + h}H${x}Z` : ""}`);

      // Wait until the aperture contains the title's entire block.
      if (!sceneRevealed && mix.full > 0 && identity) {
        const bounds = identity.getBoundingClientRect();
        if (x <= bounds.left - 8 && y <= bounds.top - 8 && x + w >= bounds.right + 8 && y + h >= bounds.bottom + 8) revealScene();
      }
    };
    const restoreInteraction = () => {
      document.body.style.overflow = previousOverflow;
      if (home) home.inert = wasInert;
      if (!wasStopped) smooth?.start();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      revealScene(reducedMotion.matches);
      // Edge controls appear after the opening reaches all four screen edges.
      chromeTween = gsap.to(chrome, {
        autoAlpha: 1, duration: reducedMotion.matches ? 0 : .45, ease: "power1.out",
        onComplete: () => { gsap.set(chrome, { clearProps: "opacity,visibility" }); },
      });
      root.dataset.zfyIntroSkip = "true";
      restoreInteraction();
      window.dispatchEvent(new Event("zfy:intro-complete"));
      setVisible(false);
    };

    if (identity) gsap.set(identity, { autoAlpha: 0, y: 16 });
    gsap.set(chrome, { autoAlpha: 0 });
    gsap.set(letters, { x: 0, y: 0, autoAlpha: 1 });
    gsap.set(letters.map(letter => letter.querySelector("svg")), { yPercent: 110 });
    draw();

    const timeline = gsap.timeline({ defaults: { ease }, onComplete: finish });
    timeline.to(letters.map(letter => letter.querySelector("svg")), {
      yPercent: 0, duration: .95, stagger: .08,
    }, 0);
    timeline.call(() => window.dispatchEvent(new Event("zfy:intro-opening")), [], BEATS.scene);
    timeline.call(() => {
      const initial = letters.map(letter => letter.getBoundingClientRect());
      wordmark.style.justifyContent = "space-between";
      const spread = letters.map(letter => letter.getBoundingClientRect());
      letters.forEach((letter, index) => gsap.set(letter, {
        x: initial[index].left - spread[index].left,
        y: initial[index].top - spread[index].top,
      }));
    }, [], BEATS.spread);
    const targetWidth = () => window.innerWidth <= 767 ? "5em" : window.innerWidth <= 991 ? "5.5em" : "12em";
    timeline.to(letters, { width: targetWidth, duration: .8 }, BEATS.spread)
      .to(letters.slice(1), { marginLeft: 0, duration: .8 }, BEATS.spread)
      .to(letters[0], { x: 0, y: 0, duration: 1.2 }, BEATS.spread)
      .to(letters[1], { x: 0, y: 0, duration: 1 }, BEATS.spread + .16)
      .to(letters[2], { x: 0, y: 0, duration: 1 }, BEATS.spread)
      .to(mix, { square: 1, duration: .3, onUpdate: draw }, BEATS.square)
      .to(mix, { square: 0, rectangle: 1, duration: 1.1, onUpdate: draw }, BEATS.rectangle)
      .to(mix, { square: 0, rectangle: 0, full: 1, duration: .8, onUpdate: draw }, BEATS.full)
      .to(letters[1].querySelector("svg"), { yPercent: 110, duration: .8 }, BEATS.full)
      .to(letters[0], {
        x: () => -(letters[0].getBoundingClientRect().right + 48),
        y: () => window.innerHeight - letters[0].getBoundingClientRect().top + letters[0].getBoundingClientRect().height + 48,
        duration: .8,
      }, BEATS.full)
      .to(letters[2], {
        x: () => window.innerWidth - letters[2].getBoundingClientRect().left + letters[2].getBoundingClientRect().width + 48,
        y: () => window.innerHeight - letters[2].getBoundingClientRect().top + letters[2].getBoundingClientRect().height + 48,
        duration: .8,
      }, BEATS.full);

    const handleResize = () => {
      const changed = Math.abs(window.innerWidth - viewport.width) > 2 || Math.abs(window.innerHeight - viewport.height) > 100;
      viewport.width = window.innerWidth;
      viewport.height = window.innerHeight;
      if (changed) timeline.progress(1);
      else draw();
    };
    const handleReducedMotion = () => { if (reducedMotion.matches) timeline.progress(1); };
    window.addEventListener("resize", handleResize);
    reducedMotion.addEventListener("change", handleReducedMotion);
    const safetyTimer = window.setTimeout(() => timeline.progress(1), 7600);

    return () => {
      window.clearTimeout(safetyTimer);
      window.removeEventListener("resize", handleResize);
      reducedMotion.removeEventListener("change", handleReducedMotion);
      timeline.kill(); sceneTween?.kill(); chromeTween?.kill();
      gsap.set([...(identity ? [identity] : []), ...chrome], { clearProps: "opacity,visibility,transform" });
      restoreInteraction();
    };
  }, []);

  if (!visible) return null;
  return <div ref={introRef} className={styles.intro} aria-hidden="true" data-brand-intro>
    <svg ref={svgRef} className={styles.cutout} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path ref={pathRef} d="M0 0H100V100H0Z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
    <div ref={wordmarkRef} className={styles.inner}>
      {GLYPHS.map((glyph, index) => <div
        ref={node => { letterRefs.current[index] = node; }}
        className={styles.letterMask} key={glyph.letter} data-intro-letter={glyph.letter}
      >
        <svg className={styles.letterShape} viewBox="0 0 290 290" aria-hidden="true">
          <path d={glyph.path} fill="currentColor" />
        </svg>
      </div>)}
    </div>
  </div>;
}
