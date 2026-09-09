"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Image from "next/image";
import Tilt from "react-parallax-tilt";

type AboutTile = {
  id: string;
  label: string;
  className: string;
  emphasis?: boolean;
  detail: string;
  meta: string;
  imageSrc?: string;
  accent: string;
};

const aboutTiles: readonly AboutTile[] = [
  {
    id: "style",
    label: "我的风格",
    className: "about-tile-style",
    detail: "偏好有氛围感的桌面和房间：屏幕、灯光、收纳和小物件都保持舒服的秩序。",
    meta: "氛围 / 视觉 / 房间",
    imageSrc: "/about/details/style-room.jpg",
    accent: "#ff5f73"
  },
  {
    id: "food",
    label: "我的食物",
    className: "about-tile-food",
    detail: "喜欢一碗热乎的牛肉面，直接、踏实，也很有生活气。",
    meta: "牛肉面 / 热食",
    imageSrc: "/about/details/food-beef-noodle.jpg",
    accent: "#e45f3d"
  },
  {
    id: "drink",
    label: "我的饮品",
    className: "about-tile-drink",
    detail: "饮品偏好简单清爽，资料里记录的是农夫山泉。",
    meta: "农夫山泉 / 清爽",
    imageSrc: "/about/details/drink-water.jpg",
    accent: "#2dbd78"
  },
  {
    id: "mbti",
    label: "我的 MBTI",
    className: "about-tile-cp",
    detail: "ENFP 竞选者：更容易被新鲜想法、表达欲和人与人之间的连接点点燃。",
    meta: "ENFP / 竞选者",
    imageSrc: "/about/details/mbti-enfp.jpg",
    accent: "#58b56c"
  },
  {
    id: "animal",
    label: "我的动物",
    className: "about-tile-birthday",
    emphasis: true,
    detail: "喜欢猫，带一点安静、灵气和距离感，是那种越看越有性格的偏好。",
    meta: "猫 / 安静 / 灵气",
    imageSrc: "/about/details/animal-cat.jpg",
    accent: "#ff776f"
  },
  {
    id: "zodiac",
    label: "我的星座",
    className: "about-tile-game",
    detail: "射手座，日期是 11.23-12.21。偏向自由、探索和行动感。",
    meta: "射手座 / 11.23-12.21",
    imageSrc: "/about/details/zodiac-sagittarius.jpg",
    accent: "#ff4d57"
  },
  {
    id: "season",
    label: "我的四季",
    className: "about-tile-season",
    detail: "最喜欢的季节是冬天，冷一点、安静一点，画面也更干净。",
    meta: "冬 / 安静 / 干净",
    imageSrc: "/about/details/weather-snow.jpg",
    accent: "#8fcdf7"
  },
  {
    id: "weather",
    label: "我的天气",
    className: "about-tile-weather",
    detail: "喜欢雪天，灰白的空气、落雪和低饱和度的城市感会让页面气质更贴近你。",
    meta: "雪天 / 低饱和",
    imageSrc: "/about/details/weather-snow.jpg",
    accent: "#92b9d7"
  },
  {
    id: "color",
    label: "我的颜色",
    className: "about-tile-color",
    emphasis: true,
    detail: "最喜欢的颜色是 Turquoise1，RGB(0, 245, 255)，HEX #00F5FF。",
    meta: "Turquoise1 / #00F5FF",
    imageSrc: "/about/details/color-turquoise.png",
    accent: "#00f5ff"
  },
  {
    id: "fruit",
    label: "我的水果",
    className: "about-tile-music",
    emphasis: true,
    detail: "喜欢红心火龙果，颜色强烈、清爽，也和页面的红色点缀很搭。",
    meta: "红心火龙果 / 清爽",
    imageSrc: "/about/details/fruit-dragon-fruit.jpg",
    accent: "#ff2f66"
  },
  {
    id: "anime",
    label: "我的生日",
    className: "about-tile-anime",
    detail: "生日记录在黄历里：冬月二十，丙午年（马）庚子月 丙子日 周一。",
    meta: "冬月二十 / 黄历",
    imageSrc: "/about/details/birthday-lunar.jpg",
    accent: "#f8c62f"
  },
  {
    id: "star",
    label: "我的角色或明星",
    className: "about-tile-star",
    detail: "这是资料里记录的最喜欢的角色，画面偏浅色、柔和，也能作为个人偏好的视觉锚点。",
    meta: "最喜欢的角色",
    imageSrc: "/about/details/role-or-star.jpg",
    accent: "#9be1d6"
  },
  {
    id: "avatar",
    label: "我的头像",
    className: "about-tile-avatar",
    emphasis: true,
    detail: "头像是一张黑白漫画风图片，带一点反差、冷感和幽默的表达。",
    meta: "黑白漫画 / 头像",
    imageSrc: "/about/details/avatar.jpg",
    accent: "#ff4d61"
  },
  {
    id: "place",
    label: "想去的地方",
    className: "about-tile-place",
    detail: "想去的地方像开阔山谷、洞口远景和远处城堡，关键词是远方、探索和风景感。",
    meta: "远方 / 山谷 / 探索",
    imageSrc: "/about/details/dream-place.jpg",
    accent: "#6cb36f"
  },
  {
    id: "subject",
    label: "我的关键词",
    className: "about-tile-subject",
    detail: "把这些偏好合起来，大概是：ENFP、冬天、雪、Turquoise1、猫、热食和有氛围的房间。",
    meta: "偏好摘要",
    imageSrc: "/about/details/style-room.jpg",
    accent: "#ff3347"
  }
] as const;

const referenceImage = "/about/about-me-reference.jpg";

function AboutMeMiniBoard() {
  return (
    <span className="about-me-mini-board" aria-hidden="true">
      <span className="about-me-mini-title">It&apos;s me</span>
      <span className="mini-box mini-style" />
      <span className="mini-box mini-food" />
      <span className="mini-box mini-drink" />
      <span className="mini-box mini-cp" />
      <span className="mini-box mini-birthday" />
      <span className="mini-box mini-game" />
      <span className="mini-box mini-season" />
      <span className="mini-box mini-weather" />
      <span className="mini-box mini-color" />
      <span className="mini-box mini-music" />
      <span className="mini-box mini-anime" />
      <span className="mini-box mini-star" />
      <span className="mini-box mini-avatar" />
      <span className="mini-box mini-place" />
      <span className="mini-box mini-subject" />
    </span>
  );
}

type AboutMeRevealProps = {
  variant?: "floating" | "card";
  density?: "compact" | "comfortable" | "expanded";
};

export default function AboutMeReveal({ variant = "floating", density = "comfortable" }: AboutMeRevealProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const lensFrameRef = useRef<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLensing, setIsLensing] = useState(false);
  const [activeTileId, setActiveTileId] = useState(aboutTiles[0].id);
  const [detailTileId, setDetailTileId] = useState<string | null>(null);
  const activeTile = aboutTiles.find((tile) => tile.id === activeTileId) ?? aboutTiles[0];
  const detailTile = aboutTiles.find((tile) => tile.id === detailTileId) ?? null;

  useEffect(() => {
    setIsMounted(true);

    if (new URLSearchParams(window.location.search).get("about") === "1") {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !boardRef.current) {
      return;
    }

    let disposed = false;
    let revertAnimation: (() => void) | undefined;

    void import("gsap").then(({ default: gsap }) => {
      if (disposed || !boardRef.current) {
        return;
      }

      const context = gsap.context(() => {
      gsap.fromTo(
        ".about-me-title",
        { opacity: 0, y: -16, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out" }
      );
      gsap.fromTo(
        ".about-me-tile",
        {
          opacity: 0,
          x: (index) => ((index % 5) - 2) * 18,
          y: (index) => (Math.floor(index / 5) - 1) * 22,
          scale: 0.78,
          rotate: (index) => ((index % 3) - 1) * 3
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.66,
          ease: "back.out(1.35)",
          stagger: 0.035
        }
      );
      }, boardRef);

      revertAnimation = () => context.revert();
    });

    return () => {
      disposed = true;
      revertAnimation?.();
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.classList.toggle("is-about-me-open", isOpen);

    return () => {
      document.body.classList.remove("is-about-me-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDetailTileId(null);
      if (lensFrameRef.current !== null) {
        window.cancelAnimationFrame(lensFrameRef.current);
        lensFrameRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!detailTileId) {
      return undefined;
    }

    const closeDetail = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailTileId(null);
      }
    };

    window.addEventListener("keydown", closeDetail);

    return () => {
      window.removeEventListener("keydown", closeDetail);
    };
  }, [detailTileId]);

  const updateLens = (event: PointerEvent<HTMLDivElement>) => {
    const board = event.currentTarget;
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    if (lensFrameRef.current !== null) {
      window.cancelAnimationFrame(lensFrameRef.current);
    }

    lensFrameRef.current = window.requestAnimationFrame(() => {
      lensFrameRef.current = null;
    const rect = board.getBoundingClientRect();
    const x = Math.min(Math.max(pointerX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(pointerY - rect.top, 0), rect.height);
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    board.style.setProperty("--lens-x", `${x}px`);
    board.style.setProperty("--lens-y", `${y}px`);
    board.style.setProperty("--lens-bg-x", `${xPercent}%`);
    board.style.setProperty("--lens-bg-y", `${yPercent}%`);
    board.style.setProperty("--detail-x", `${x}px`);
    board.style.setProperty("--detail-y", `${y}px`);
    board.style.setProperty("--detail-shift-x", xPercent > 62 ? "-112%" : "12%");
    board.style.setProperty("--detail-shift-y", yPercent > 68 ? "-88%" : "-18%");
    board.classList.add("is-lensing");

    const lensRadius = parseFloat(getComputedStyle(document.documentElement).fontSize || "16") * 5.75;

    board.querySelectorAll<HTMLElement>(".about-me-tile").forEach((tile) => {
      const tileRect = tile.getBoundingClientRect();
      const closestX = Math.min(Math.max(pointerX, tileRect.left), tileRect.right);
      const closestY = Math.min(Math.max(pointerY, tileRect.top), tileRect.bottom);
      const distance = Math.hypot(pointerX - closestX, pointerY - closestY);

      tile.style.setProperty("--tile-reveal-x", `${pointerX - tileRect.left}px`);
      tile.style.setProperty("--tile-reveal-y", `${pointerY - tileRect.top}px`);
      tile.classList.toggle("is-revealed-by-lens", distance <= lensRadius);
    });

    if (!isLensing) {
      setIsLensing(true);
    }
    });
  };

  const updateTileReveal = (event: PointerEvent<HTMLButtonElement>, tileId: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    event.currentTarget.style.setProperty("--tile-reveal-x", `${x}px`);
    event.currentTarget.style.setProperty("--tile-reveal-y", `${y}px`);
    setActiveTileId((current) => (current === tileId ? current : tileId));
  };

  const closePanel = () => {
    setIsOpen(false);
    setIsLensing(false);
    setDetailTileId(null);
  };

  const panel =
    isMounted && isOpen
      ? createPortal(
          <section className="about-me-layer" aria-label="关于我">
            <button className="about-me-backdrop" onClick={closePanel} type="button" />

            <div className="about-me-panel">
              <div className="about-me-panel-header">
                <p>It&apos;s me</p>
                <button aria-label="关闭关于我" onClick={closePanel} type="button">
                  <X size={20} />
                </button>
              </div>

              <div
                className={`about-me-board ${isLensing ? "is-lensing" : ""}`}
                onPointerLeave={(event) => {
                  event.currentTarget.classList.remove("is-lensing");
                  event.currentTarget.querySelectorAll(".about-me-tile.is-revealed-by-lens").forEach((tile) => {
                    tile.classList.remove("is-revealed-by-lens");
                  });
                  setIsLensing(false);
                }}
                onPointerMove={updateLens}
                ref={boardRef}
                style={
                  {
                    "--reference-image": `url(${referenceImage})`,
                    "--active-detail-image": `url(${activeTile.imageSrc ?? referenceImage})`,
                    "--active-accent": activeTile.accent
                  } as CSSProperties
                }
              >
                <div className="about-me-title">It&apos;s me</div>
                {aboutTiles.map((tile) => (
                  <button
                    aria-label={`${tile.label}：${tile.meta}。${tile.detail}`}
                    aria-pressed={detailTileId === tile.id}
                    className={`about-me-tile ${tile.className} ${tile.emphasis ? "is-emphasis" : ""} ${
                      activeTile.id === tile.id ? "is-active" : ""
                    }`}
                    key={tile.id}
                    onClick={() => {
                      setActiveTileId(tile.id);
                      setDetailTileId(tile.id);
                    }}
                    onFocus={() => setActiveTileId(tile.id)}
                    onPointerEnter={(event) => updateTileReveal(event, tile.id)}
                    onPointerMove={(event) => updateTileReveal(event, tile.id)}
                    style={{ "--about-tile-accent": tile.accent } as CSSProperties}
                    type="button"
                  >
                    <span className="about-me-tile-text">{tile.label}</span>
                    {tile.imageSrc ? (
                      <span className="about-me-tile-image" aria-hidden="true">
                        <Image alt="" fill sizes="(max-width: 760px) 16vw, 14rem" src={tile.imageSrc} />
                      </span>
                    ) : null}
                  </button>
                ))}
                <div className="about-me-cursor-glow" aria-hidden="true" />
                <div className="about-me-lens" aria-hidden="true" />

                {detailTile ? (
                  <div
                    className="about-me-photo-stage"
                    style={{ "--about-detail-accent": detailTile.accent } as CSSProperties}
                  >
                    <button
                      aria-label="关闭图片"
                      className="about-me-photo-backdrop"
                      onClick={() => setDetailTileId(null)}
                      type="button"
                    />
                    <div className="about-me-photo-card" role="dialog" aria-label={detailTile.label}>
                      <span className="about-me-photo-burst" aria-hidden="true" />
                      <div className="about-me-photo-frame">
                        {detailTile.imageSrc ? (
                          <Image
                            alt={detailTile.label}
                            fill
                            sizes="(max-width: 760px) 72vw, 34rem"
                            src={detailTile.imageSrc}
                          />
                        ) : null}
                      </div>
                      <button
                        aria-label="关闭图片"
                        className="about-me-photo-close"
                        onClick={() => setDetailTileId(null)}
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>,
          document.body
        )
      : null;

  return (
    <div className={`about-me-widget ${variant === "card" ? "about-me-widget-card" : ""}`}>
      {variant === "card" ? (
        <Tilt
          className="about-me-tilt"
          glareEnable
          glareMaxOpacity={0.18}
          glarePosition="all"
          perspective={900}
          scale={1.015}
          tiltMaxAngleX={7}
          tiltMaxAngleY={9}
          transitionSpeed={900}
        >
          <button className="about-me-trigger" onClick={() => setIsOpen(true)} type="button">
            <span className={`about-me-card-preview about-me-card-preview-${density}`}>
              <AboutMeMiniBoard />
            </span>
          </button>
        </Tilt>
      ) : (
        <button className="about-me-trigger" onClick={() => setIsOpen(true)} type="button">
          关于我
        </button>
      )}
      {panel}
    </div>
  );
}
