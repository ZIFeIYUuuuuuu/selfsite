// lib/homeContent.ts
// Single source of truth for homepage content.
// Photo src paths, placeholder tags, text fragments — all editable here.

// ── Photo pool ─────────────────────────────────────────────────────────────
// These 14 photos are the POOL. The player draws one at a time.
// Do not add position/layout data here — the player handles that.

export type PhotoItem = {
  src: string;
  alt: string;
};

export const PHOTO_POOL: readonly PhotoItem[] = [
  { src: "/about/details/avatar.jpg",           alt: "头像" },
  { src: "/about/details/animal-cat.jpg",       alt: "猫" },
  { src: "/about/details/birthday-lunar.jpg",   alt: "生日" },
  { src: "/about/details/dream-place.jpg",      alt: "梦想的地方" },
  { src: "/about/details/drink-water.jpg",      alt: "饮料" },
  { src: "/about/details/food-beef-noodle.jpg", alt: "食物" },
  { src: "/about/details/fruit-dragon-fruit.jpg", alt: "水果" },
  { src: "/about/details/mbti-enfp.jpg",        alt: "MBTI" },
  { src: "/about/details/role-or-star.jpg",     alt: "角色" },
  { src: "/about/details/style-room.jpg",       alt: "房间" },
  { src: "/about/details/weather-snow.jpg",     alt: "天气" },
  { src: "/about/details/zodiac-sagittarius.jpg", alt: "星座" },
  { src: "/about/details/color-turquoise.png",  alt: "颜色" },
] as const;

// ── Identity labels ────────────────────────────────────────────────────────
// Three configurable tags shown under the name. Replace text with final copy.

export const IDENTITY_TAGS: readonly string[] = [
  "标签一",
  "标签二",
  "标签三",
] as const;

// Bio: leave empty — final copy to be provided later
export const IDENTITY_BIO = "";

// ── Text fragments for scroll choreography ────────────────────────────────
// start/peak/end: scroll progress [0, 1] across the scroll stage
// fromX/fromY: entry offset in vw/vh units
// peakX/peakY: position at peak relative to viewport center in vw/vh
// All text content is placeholder — replace with final copy.

export type TextFragment = {
  id: string;
  text: string;
  start: number;
  peak: number;
  end: number;
  fromX: number;
  fromY: number;
  peakX: number;
  peakY: number;
  fromScale: number;
  fromBlur: number;
  fromOpacity: number;
  exitX: number;
  exitY: number;
  fontSize: string;
  fontFamily: "display" | "ui" | "mono";
  fontWeight: number;
  textAlign: "left" | "center" | "right";
  color: string;
};

export const TEXT_FRAGMENTS: readonly TextFragment[] = [
  {
    id: "f1",
    text: "我在做 AI Agent",
    start: 0.08, peak: 0.16, end: 0.24,
    fromX: -50, fromY: 8,
    peakX: -33, peakY: -20,
    exitX: 20, exitY: -20,
    fromScale: 0.85, fromBlur: 16, fromOpacity: 0,
    fontSize: "clamp(2rem, 4vw, 3.2rem)",
    fontFamily: "display", fontWeight: 500,
    textAlign: "left", color: "var(--text)",
  },
  {
    id: "f2",
    text: "还有自动化工具",
    start: 0.22, peak: 0.30, end: 0.38,
    fromX: 55, fromY: -12,
    peakX: 33, peakY: -13,
    exitX: -15, exitY: -18,
    fromScale: 0.90, fromBlur: 10, fromOpacity: 0,
    fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)",
    fontFamily: "ui", fontWeight: 400,
    textAlign: "right", color: "var(--muted)",
  },
  {
    id: "f3",
    text: "把想法做成能运行的系统",
    start: 0.39, peak: 0.47, end: 0.56,
    fromX: 0, fromY: 40,
    peakX: 0, peakY: 31,
    exitX: 0, exitY: -30,
    fromScale: 0.75, fromBlur: 22, fromOpacity: 0,
    fontSize: "clamp(2.4rem, 5vw, 4rem)",
    fontFamily: "display", fontWeight: 500,
    textAlign: "center", color: "var(--text)",
  },
  {
    id: "f4",
    text: "能解释",
    start: 0.53, peak: 0.59, end: 0.68,
    fromX: -65, fromY: -5,
    peakX: -32, peakY: 29,
    exitX: -50, exitY: 30,
    fromScale: 1.15, fromBlur: 0, fromOpacity: 0,
    fontSize: "clamp(1rem, 2.2vw, 1.8rem)",
    fontFamily: "mono", fontWeight: 400,
    textAlign: "left", color: "var(--brand-red)",
  },
  {
    id: "f5",
    text: "能持续迭代",
    start: 0.53, peak: 0.59, end: 0.68,
    fromX: 70, fromY: 5,
    peakX: 32, peakY: 29,
    exitX: 55, exitY: 30,
    fromScale: 1.15, fromBlur: 0, fromOpacity: 0,
    fontSize: "clamp(1rem, 2.2vw, 1.8rem)",
    fontFamily: "mono", fontWeight: 400,
    textAlign: "right", color: "var(--brand-red)",
  },
  {
    id: "f6",
    text: "子非鱼",
    start: 0.72, peak: 0.79, end: 0.90,
    fromX: 0, fromY: 0,
    peakX: 0, peakY: -24,
    exitX: 0, exitY: -10,
    fromScale: 0.2, fromBlur: 32, fromOpacity: 0,
    fontSize: "clamp(5rem, 12vw, 10rem)",
    fontFamily: "display", fontWeight: 500,
    textAlign: "center", color: "var(--text)",
  },
] as const;
