"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./ScrollPhotoSequence.module.css";

const photos = [
  { src: "/about/details/avatar.jpg", label: "头像", ratio: 938 / 940 },
  { src: "/about/details/animal-cat.jpg", label: "猫", ratio: 1149 / 861 },
  { src: "/about/details/birthday-lunar.jpg", label: "生日", ratio: 477 / 478 },
  { src: "/about/details/dream-place.jpg", label: "想去的地方", ratio: 1105 / 652 },
  { src: "/about/details/drink-water.jpg", label: "饮水", ratio: 1239 / 1215 },
  { src: "/about/details/food-beef-noodle.jpg", label: "牛肉面", ratio: 1049 / 1400 },
  { src: "/about/details/fruit-dragon-fruit.jpg", label: "火龙果", ratio: 1102 / 1300 },
  { src: "/about/details/mbti-enfp.jpg", label: "ENFP", ratio: 439 / 277 },
  { src: "/about/details/role-or-star.jpg", label: "喜欢的角色", ratio: 1 },
  { src: "/about/details/style-room.jpg", label: "房间", ratio: 1400 / 933 },
  { src: "/about/details/weather-snow.jpg", label: "雪天", ratio: 1151 / 648 },
  { src: "/about/details/zodiac-sagittarius.jpg", label: "射手座", ratio: 848 / 936 },
  { src: "/about/details/color-turquoise.png", label: "松石绿", ratio: 494 / 31 },
] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export default function ScrollPhotoSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let active = false;
    let progress = 0;
    const updateProgress = () => {
      const rect = section.getBoundingClientRect();
      progress = clamp(-rect.top / Math.max(1, section.offsetHeight - window.innerHeight));
      if (!frame) frame = requestAnimationFrame(render);
    };
    const render = () => {
      frame = 0;
      if (!active || reduced.matches || document.hidden) return;
      section.style.setProperty("--sequence-progress", String(progress));
      const fan = smooth((progress - 0.77) / 0.23);
      const fanGap = Math.min(28, window.innerWidth * 0.026);
      const arrivalRange = 0.75;
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const ratio = Number(card.dataset.ratio || 1);
        card.style.width = `${Math.max(96, Math.min(650, window.innerWidth * 0.56, window.innerHeight * 0.56 * ratio))}px`;
        const enterAt = (index / photos.length) * arrivalRange;
        const appeared = smooth((progress - enterAt) / (arrivalRange / photos.length * 0.75));
        const center = (photos.length - 1) / 2;
        const offset = index - center;
        const stackX = Math.sin(index * 1.73) * 7;
        const stackY = Math.cos(index * 1.31) * 6 + (1 - appeared) * 70;
        const x = stackX * (1 - fan) + offset * fanGap * fan;
        const y = stackY + Math.abs(offset) * 4 * fan;
        const rotation = Math.sin(index * 1.19) * 2.1 * (1 - fan) + offset * 3.05 * fan;
        const scale = 0.93 + appeared * 0.07 - Math.abs(offset) * 0.0015 * fan;
        card.style.opacity = String(appeared);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
        card.style.zIndex = String(fan > 0.35 ? 50 - Math.round(Math.abs(offset)) : index + 1);
      });
      if (countRef.current) {
        const count = Math.min(photos.length, Math.floor(clamp(progress / arrivalRange) * photos.length));
        countRef.current.textContent = `${String(count).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
      }
    };
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) updateProgress(); });
    observer.observe(section);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    const motionChange = () => { cardsRef.current.forEach((card, index) => { if (card) { card.style.opacity = reduced.matches ? (index === 0 ? "1" : "0") : "0"; card.style.transform = "translate(-50%, -50%)"; } }); updateProgress(); };
    reduced.addEventListener("change", motionChange);
    motionChange();
    return () => {
      observer.disconnect(); window.removeEventListener("scroll", updateProgress); window.removeEventListener("resize", updateProgress);
      reduced.removeEventListener("change", motionChange); cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={sectionRef} className={styles.sequence} aria-label="滚动浏览生活照片">
    <div className={styles.sticky}>
      <div className={styles.deck}>
        {photos.map((photo, index) => {
          return <div className={styles.card} data-ratio={photo.ratio} key={photo.src} ref={(node) => { cardsRef.current[index] = node; }} style={{ width: "56vw", aspectRatio: String(photo.ratio), opacity: 0 }}>
            <Image src={photo.src} alt={`${photo.label}生活照片`} fill sizes="(max-width: 700px) 76vw, 650px" priority={index < 4} />
          </div>;
        })}
      </div>
      <div className={styles.label}><span>PHOTO SEQUENCE</span><span>向下滚动，逐张发牌并展开</span><span ref={countRef}>00 / 13</span></div>
      <div className={styles.progress} aria-hidden="true"><span /></div>
    </div>
  </section>;
}
