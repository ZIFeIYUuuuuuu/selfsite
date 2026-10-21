"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { notes } from "@/lib/site-content";
import styles from "./ReferenceHome.module.css";

const hidden = "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)";
const revealed = "polygon(0% 0%, 100% 0%, 100% 101%, 0% 101%)";

export default function NotesExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navigateRef = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-note-row]"));
    const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-note-slide]"));
    const masks = Array.from(root.querySelectorAll<HTMLElement>("[data-note-mask]"));
    const images = Array.from(root.querySelectorAll<HTMLElement>("[data-note-artwork]"));
    const copy = Array.from(root.querySelectorAll<HTMLElement>("[data-note-copy]"));
    const media = gsap.matchMedia();
    navigateRef.current = setActive;

    media.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
      const smooth = window.__zfyLenis;
      const ease = gsap.parseEase("power2.inOut");
      gsap.set(rows, { opacity: .28 });
      gsap.set(slides, { opacity: 1, visibility: "visible", clipPath: "none", scale: 1, y: 0, zIndex: index => index + 1 });
      gsap.set(masks, { clipPath: hidden });
      gsap.set(copy, { opacity: 0 });
      gsap.set(images, { scale: 1.1, transformOrigin: "50% 50%" });
      const syncActive = (position: number) => setActive(Math.max(0, Math.min(notes.length - 1, Math.floor(position - .12 + .000001))));
      const timeline = gsap.timeline({
        defaults: { duration: .9, ease: "power2.inOut" },
        onUpdate: () => syncActive(timeline.time()),
      });
      for (let index = 0; index < notes.length; index++) {
        timeline.to(masks[index], { clipPath: revealed }, index)
          .to(images[index], { scale: 1, ease: "none" }, index)
          .to(copy[index], { opacity: 1, duration: .16, ease: "none" }, index + .12)
          .to(rows[index], { opacity: 1, duration: .28, ease: "none" }, index)
          .addLabel(`note-${index}`, index + 1);
        if (index > 0) timeline.to(images[index - 1], { scale: 1.2, ease: "none" }, index)
          .to(copy[index - 1], { opacity: 0, duration: .12, ease: "none" }, index)
          .to(rows[index - 1], { opacity: .28, duration: .28, ease: "none" }, index);
      }
      // Each viewport contains .9 of reveal followed by .1 of rest.
      timeline.to({}, { duration: .01 }, notes.length - .01);
      let direction = 1;
      let lastY = window.scrollY;
      let touching = false;
      let wheelTimer = 0;
      let idleTimer = 0;
      let requested: number | null = null;
      let requestedUntil = 0;
      const chooseStop = (progress: number) => {
        if (requested !== null && performance.now() < requestedUntil) return (requested + 1) / notes.length;
        const position = Math.max(0, Math.min(1, progress)) * notes.length;
        const lower = Math.min(notes.length - 1, Math.floor(position));
        const amount = ease(Math.max(0, Math.min(1, (position - lower) / .9)));
        const threshold = direction > 0 ? .1 : .9;
        return (lower + (amount >= threshold ? 1 : 0)) / notes.length;
      };
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => `+=${notes.length * window.innerHeight}`,
        animation: timeline,
        scrub: smooth ? true : .8,
        invalidateOnRefresh: true,
        onRefresh: self => syncActive(self.progress * notes.length),
        ...(!smooth ? { snap: { snapTo: chooseStop, delay: .09, duration: { min: .45, max: .65 }, inertia: false, ease: "power1.inOut" } } : {}),
      });
      const snap = () => {
        if (!smooth || touching || smooth.isStopped) return;
        const heading = smooth.isScrolling === "smooth" ? smooth.targetScroll : window.scrollY;
        if (heading < trigger.start || heading > trigger.end) return;
        const range = trigger.end - trigger.start;
        const destination = Math.round(trigger.start + range * chooseStop((heading - trigger.start) / range));
        if (Math.abs(destination - heading) > 2) smooth.scrollTo(destination, { lerp: .1 });
      };
      const onScroll = () => {
        const nextY = window.scrollY;
        if (nextY !== lastY) direction = nextY > lastY ? 1 : -1;
        lastY = nextY;
        ScrollTrigger.update();
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(snap, 90);
      };
      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || !event.deltaY) return;
        direction = event.deltaY > 0 ? 1 : -1;
        requested = null;
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(snap, 90);
      };
      const onTouchStart = () => { touching = true; window.clearTimeout(idleTimer); window.clearTimeout(wheelTimer); };
      const onTouchEnd = () => { touching = false; window.clearTimeout(idleTimer); idleTimer = window.setTimeout(snap, 90); };
      navigateRef.current = index => {
        trigger.refresh();
        requested = index;
        requestedUntil = performance.now() + 1300;
        const destination = trigger.start + (trigger.end - trigger.start) * (index + 1) / notes.length;
        if (smooth) smooth.scrollTo(destination, { duration: .8 });
        else window.scrollTo({ top: destination, behavior: "smooth" });
      };
      const unsubscribe = smooth?.on("scroll", onScroll);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchEnd, { passive: true });
      let refreshFrame = 0;
      const layoutObserver = new ResizeObserver(() => {
        if (refreshFrame) cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = 0;
          smooth?.resize();
          trigger.refresh();
        });
      });
      layoutObserver.observe(root);
      layoutObserver.observe(document.body);
      ScrollTrigger.refresh();
      return () => {
        layoutObserver.disconnect();
        if (refreshFrame) cancelAnimationFrame(refreshFrame);
        unsubscribe?.();
        window.clearTimeout(wheelTimer); window.clearTimeout(idleTimer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
        trigger.kill(); timeline.kill();
        gsap.set([...rows, ...slides, ...masks, ...images, ...copy], { clearProps: "opacity,visibility,clipPath,transform,zIndex" });
        navigateRef.current = setActive;
      };
    });
    return () => { media.revert(); };
  }, []);

  return <div ref={rootRef} className={styles.noteStory} style={{ height: `${(notes.length + 1) * 100}svh` } as CSSProperties}>
    <div className={styles.noteSticky} data-scroll-story-stage="true">
      <div className={styles.noteExperience}>
        <div className={styles.noteList} role="tablist" aria-label="工作笔记">
          {notes.map((note, index) => <button
            key={note.slug} id={`note-tab-${index}`} type="button" role="tab" data-note-row
            aria-selected={active === index} aria-controls="note-preview" tabIndex={active === index ? 0 : -1}
            className={styles.noteRow} data-selected={active === index}
            onClick={() => navigateRef.current(index)} onFocus={() => navigateRef.current(index)}
            onKeyDown={event => {
              const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
              if (!direction) return;
              event.preventDefault();
              document.getElementById(`note-tab-${(index + direction + notes.length) % notes.length}`)?.focus();
            }}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.noteTitle}><strong>{note.shortTitle}</strong><small>{note.summary}</small></span>
            <span>{note.format}</span><span aria-hidden="true">↗</span>
          </button>)}
        </div>
        <article className={styles.notePreview} id="note-preview" role="tabpanel" aria-labelledby={`note-tab-${active}`}>
          <div className={styles.notePreviewTrack}>
            {notes.map((note, index) => <section className={styles.notePreviewSlide} key={note.slug} data-note-slide data-active={active === index} aria-hidden={active !== index}>
              <figure className={styles.notePreviewCover} data-note-mask>
                <Image src={note.cover} alt={`${note.shortTitle} 文章封面`} fill sizes="(max-width: 760px) 100vw, 44vw" data-note-artwork />
              </figure>
              <div className={styles.notePreviewCopy} data-note-copy>
              <p className={styles.notePreviewMeta}>NOTE / {String(index + 1).padStart(2, "0")} <span>·</span> {note.format}</p>
              <h3>{note.title}</h3>
              <p className={styles.notePreviewLead}>{note.lead}</p>
              <Link href={`/notes?note=${note.slug}`} className={styles.noteRead} tabIndex={active === index ? 0 : -1}>Read this note <span aria-hidden="true">↗</span></Link>
              </div>
            </section>)}
          </div>
        </article>
      </div>
      <p className={styles.noteHint}><span className={styles.noteScrollHint}>向下滚动切换笔记 · 反向滚动返回</span><span className={styles.noteTapHint}>点击标题切换笔记</span><span>·</span> {String(active + 1).padStart(2, "0")} / {String(notes.length).padStart(2, "0")}</p>
    </div>
  </div>;
}
