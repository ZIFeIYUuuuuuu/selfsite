"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type AboutTile = {
  label: string;
  className: string;
  emphasis?: boolean;
};

const aboutTiles: readonly AboutTile[] = [
  { label: "我的风格", className: "about-tile-style" },
  { label: "我的食物", className: "about-tile-food" },
  { label: "我的饮品或奶茶", className: "about-tile-drink" },
  { label: "我的 CP", className: "about-tile-cp" },
  { label: "我的生日", className: "about-tile-birthday", emphasis: true },
  { label: "我的游戏", className: "about-tile-game" },
  { label: "我的四季", className: "about-tile-season" },
  { label: "我的天气", className: "about-tile-weather" },
  { label: "我的颜色", className: "about-tile-color", emphasis: true },
  { label: "我的音乐", className: "about-tile-music", emphasis: true },
  { label: "我的动漫或电视剧", className: "about-tile-anime" },
  { label: "我的角色或明星", className: "about-tile-star" },
  { label: "我的头像", className: "about-tile-avatar", emphasis: true },
  { label: "想去的地方", className: "about-tile-place" },
  { label: "我的学科", className: "about-tile-subject" }
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
};

export default function AboutMeReveal({ variant = "floating" }: AboutMeRevealProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const [lens, setLens] = useState({ x: 50, y: 50, visible: false });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("about") === "1" && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, []);

  const updateLens = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setLens({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
      visible: true
    });
  };

  const closePanel = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details className={`about-me-widget ${variant === "card" ? "about-me-widget-card" : ""}`} ref={detailsRef}>
      <summary className="about-me-trigger">
        {variant === "card" ? (
          <span className="about-me-card-preview">
            <AboutMeMiniBoard />
            <span>打开我的偏好拼图</span>
          </span>
        ) : (
          "关于我"
        )}
      </summary>

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
            className={`about-me-board ${lens.visible ? "is-lensing" : ""}`}
            onMouseLeave={() => setLens((current) => ({ ...current, visible: false }))}
            onMouseMove={updateLens}
            style={
              {
                "--lens-x": `${lens.x}%`,
                "--lens-y": `${lens.y}%`,
                "--reference-image": `url(${referenceImage})`
              } as React.CSSProperties
            }
          >
            <div className="about-me-title">It&apos;s me</div>
            {aboutTiles.map((tile) => (
              <button
                className={`about-me-tile ${tile.className} ${tile.emphasis ? "is-emphasis" : ""}`}
                key={tile.label}
                type="button"
              >
                {tile.label}
              </button>
            ))}
            <div className="about-me-lens" aria-hidden="true" />
          </div>
        </div>
      </section>
    </details>
  );
}
