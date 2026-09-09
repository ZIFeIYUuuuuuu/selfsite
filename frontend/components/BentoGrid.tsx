"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  Grip,
  Inbox,
  Link2,
  Mail,
  Maximize2,
  MessageCircleMore,
  PencilLine,
  QrCode,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Responsive,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
  useContainerWidth
} from "react-grid-layout";
import { noCompactor } from "react-grid-layout/core";

import AboutMeReveal from "@/components/AboutMeReveal";
import { githubRepositories, notes, selectedWork, siteProfile } from "@/lib/site-content";

import styles from "./BentoGrid.module.css";

type CardId = "hero" | "project" | "about" | "status" | "contact" | "notes";
type CardMode = "compact" | "comfortable" | "expanded";
type QrId = "qq" | "wechat";
type Breakpoint = "lg" | "md" | "sm" | "xs";
type Layouts = ResponsiveLayouts<Breakpoint>;

const layoutStorageKey = "selfsite:bento-layout:v5";
const breakpoints: Record<Breakpoint, number> = { lg: 1100, md: 900, sm: 640, xs: 0 };
const cols: Record<Breakpoint, number> = { lg: 12, md: 12, sm: 6, xs: 1 };

const defaultLayouts: Record<Breakpoint, Layout> = {
  lg: [
    { i: "hero", x: 0, y: 0, w: 7, h: 5, minW: 3, minH: 2 },
    { i: "project", x: 7, y: 0, w: 5, h: 5, minW: 3, minH: 2 },
    { i: "notes", x: 0, y: 5, w: 3, h: 4, minW: 2, minH: 2 },
    { i: "contact", x: 3, y: 5, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "about", x: 7, y: 5, w: 5, h: 4, minW: 2, minH: 2 }
  ],
  md: [
    { i: "hero", x: 0, y: 0, w: 12, h: 5, minW: 3, minH: 2 },
    { i: "project", x: 0, y: 5, w: 7, h: 5, minW: 3, minH: 2 },
    { i: "about", x: 7, y: 5, w: 5, h: 5, minW: 2, minH: 2 },
    { i: "notes", x: 0, y: 10, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "contact", x: 4, y: 10, w: 8, h: 4, minW: 2, minH: 2 }
  ],
  sm: [
    { i: "hero", x: 0, y: 0, w: 6, h: 5, minW: 2, minH: 2 },
    { i: "project", x: 0, y: 5, w: 6, h: 5, minW: 2, minH: 2 },
    { i: "about", x: 0, y: 10, w: 6, h: 5, minW: 2, minH: 2 },
    { i: "contact", x: 0, y: 15, w: 6, h: 4, minW: 2, minH: 2 },
    { i: "notes", x: 0, y: 19, w: 6, h: 4, minW: 2, minH: 2 }
  ],
  xs: [
    { i: "hero", x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 2 },
    { i: "project", x: 0, y: 4, w: 1, h: 4, minW: 1, minH: 2 },
    { i: "about", x: 0, y: 8, w: 1, h: 4, minW: 1, minH: 2 },
    { i: "contact", x: 0, y: 12, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "notes", x: 0, y: 15, w: 1, h: 3, minW: 1, minH: 2 }
  ]
};

const contactLinks = [
  { label: "GitHub", href: siteProfile.github, icon: Link2, external: true },
  {
    label: "邮箱",
    href: `mailto:${siteProfile.email}?subject=${encodeURIComponent(`来自 ${siteProfile.name} 的来信`)}`,
    icon: Mail,
    external: false
  }
].filter((item) => item.external || Boolean(siteProfile.email));

const qrItems = [
  {
    id: "qq" as const,
    label: "QQ",
    enabled: process.env.NEXT_PUBLIC_CONTACT_QQ_ENABLED === "true",
    icon: MessageCircleMore,
    qrSrc: "/contact/qq-red.png",
    qrAlt: "QQ 二维码"
  },
  {
    id: "wechat" as const,
    label: "微信",
    enabled: process.env.NEXT_PUBLIC_CONTACT_WECHAT_ENABLED === "true",
    icon: QrCode,
    qrSrc: "/contact/wechat-green.png",
    qrAlt: "微信二维码"
  }
].filter((item) => item.enabled);

function getMode(item: LayoutItem, breakpoint: Breakpoint): CardMode {
  if (breakpoint === "xs") {
    return "comfortable";
  }

  const area = item.w * item.h;

  if (item.w <= 3 || item.h <= 2 || area <= 8) {
    return "compact";
  }

  if (item.w >= 5 && item.h >= 4 && area >= 18) {
    return "expanded";
  }

  return "comfortable";
}

function getBreakpointForWidth(width: number): Breakpoint {
  if (width >= breakpoints.lg) {
    return "lg";
  }

  if (width >= breakpoints.md) {
    return "md";
  }

  if (width >= breakpoints.sm) {
    return "sm";
  }

  return "xs";
}

function coerceLayoutNumber(value: unknown, fallback: number) {
  const next = Number(value);

  return Number.isFinite(next) ? next : fallback;
}

function normalizeLayouts(value: unknown): Layouts | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Partial<Record<Breakpoint, Layout>>;
  const next = { ...defaultLayouts };

  for (const key of Object.keys(defaultLayouts) as Breakpoint[]) {
    const items = source[key];

    if (!Array.isArray(items)) {
      return null;
    }

    const savedById = new Map(items.filter((item) => typeof item.i === "string").map((item) => [item.i, item]));

    next[key] = defaultLayouts[key].map((fallback) => {
      const saved = savedById.get(fallback.i);

      if (!saved) {
        return fallback;
      }

      return {
        ...fallback,
        ...saved,
        x: coerceLayoutNumber(saved.x, fallback.x),
        y: coerceLayoutNumber(saved.y, fallback.y),
        w: coerceLayoutNumber(saved.w, fallback.w),
        h: coerceLayoutNumber(saved.h, fallback.h),
        minW: fallback.minW,
        minH: fallback.minH
      };
    });
  }

  return next;
}

type CardShellProps = {
  id: CardId;
  isEditing: boolean;
  mode: CardMode;
  title: string;
  className: string;
  children: ReactNode;
};

function CardShell({ id, isEditing, mode, title, className, children }: CardShellProps) {
  return (
    <motion.article
      className={`${styles.card} ${className}`}
      data-card-id={id}
      data-editing={isEditing}
      data-card-size={mode}
      onPointerEnter={(event) => {
        event.currentTarget.dataset.pointerInside = "true";
      }}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.pointerInside = "false";
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      }}
    >
      <div className={styles.cardTools} aria-hidden={!isEditing}>
        <div aria-label={`拖动${title}`} className={styles.dragHandle} role="presentation">
          <Grip size={15} />
        </div>
      </div>

      <div className={styles.cardContent}>{children}</div>

      <div className={styles.resizeHint} aria-hidden="true">
        <Maximize2 size={14} />
      </div>
    </motion.article>
  );
}

export default function BentoGrid() {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [isReady, setIsReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [activeQr, setActiveQr] = useState<QrId | null>(null);
  const [isTouchLike, setIsTouchLike] = useState(false);
  const isInteractingRef = useRef(false);
  const { width, containerRef, mounted } = useContainerWidth();
  const currentBreakpoint = useMemo(() => getBreakpointForWidth(width), [width]);

  const featuredWork = selectedWork[0];
  const featuredRepos = githubRepositories.slice(0, 3);
  const latestNotes = notes.slice(0, 1);
  const currentLayout: Layout = layouts[currentBreakpoint] ?? defaultLayouts[currentBreakpoint];
  const activeQrItem = qrItems.find((item) => item.id === activeQr) ?? null;
  const layoutMap = useMemo(
    () => Object.fromEntries(currentLayout.map((item) => [item.i as CardId, item])) as Record<CardId, LayoutItem>,
    [currentLayout]
  );
  const modes = useMemo(
    () => Object.fromEntries((Object.keys(layoutMap) as CardId[]).map((id) => [id, getMode(layoutMap[id], currentBreakpoint)])) as Record<
      CardId,
      CardMode
    >,
    [currentBreakpoint, layoutMap]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(layoutStorageKey);
      const parsed = saved ? normalizeLayouts(JSON.parse(saved)) : null;

      if (parsed) {
        setLayouts(parsed);
      }
    } catch {
      setLayouts(defaultLayouts);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(layoutStorageKey, JSON.stringify(layouts));
  }, [isReady, layouts]);

  useEffect(() => {
    setIsTouchLike(!window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!activeQr) {
      return undefined;
    }

    const closeQr = (event: Event) => {
      if (event.type === "keydown" && (event as KeyboardEvent).key !== "Escape") {
        return;
      }

      const target = event.target as Element | null;

      if (target?.closest?.("[data-qr-action='true']")) {
        return;
      }

      setActiveQr(null);
    };

    window.addEventListener("pointerdown", closeQr);
    window.addEventListener("keydown", closeQr);

    return () => {
      window.removeEventListener("pointerdown", closeQr);
      window.removeEventListener("keydown", closeQr);
    };
  }, [activeQr]);

  const updateLayouts = (_layout: Layout, allLayouts: Layouts) => {
    // react-grid-layout emits this callback for every pointer move. Keeping
    // the controlled layouts stable during a drag lets the library's own
    // transform loop stay at pointer cadence instead of restarting React
    // reconciliation on every frame.
    if (!isInteractingRef.current) {
      setLayouts(allLayouts);
    }
  };

  const updateCurrentLayout = (layout: Layout) => {
    setLayouts((current) => ({
      ...current,
      [currentBreakpoint]: layout
    }));
  };

  const startLayoutInteraction = () => {
    isInteractingRef.current = true;
  };

  const stopLayoutInteraction = (layout: Layout) => {
    isInteractingRef.current = false;
    updateCurrentLayout(layout);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    setActiveQr(null);
    setIsProjectDetailsOpen(false);
    window.localStorage.removeItem(layoutStorageKey);
  };

  const toggleEditing = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Persist synchronously before the reload so the next render cannot show
    // a stale controlled layout after leaving edit mode.
    try {
      window.localStorage.setItem(layoutStorageKey, JSON.stringify(layouts));
    } catch {
      // The next page render will fall back to the default layout if storage
      // is unavailable (private browsing or a blocked storage policy).
    }
    window.location.reload();
  };

  return (
    <section className={styles.shell} data-editing={isEditing}>
      <AnimatePresence>
        {isEditing ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.layoutToolbar}
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <button className={styles.resetLayoutButton} onClick={resetLayout} type="button">
              <RotateCcw size={15} />
              重置布局
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div ref={containerRef} className={styles.gridMeasure}>
        {mounted ? (
          <Responsive
            breakpoints={breakpoints}
            className={styles.grid}
            cols={cols}
            compactor={noCompactor}
            dragConfig={{
              enabled: isEditing,
              bounded: false,
              cancel: "a,button,input,textarea,select",
              handle: `.${styles.dragHandle}`
            }}
            layouts={layouts}
            margin={[14, 14]}
            onDragStart={startLayoutInteraction}
            onDragStop={stopLayoutInteraction}
            onLayoutChange={updateLayouts}
            onResizeStart={startLayoutInteraction}
            onResizeStop={stopLayoutInteraction}
            resizeConfig={{
              enabled: isEditing,
              handles: ["se"]
            }}
            rowHeight={78}
            width={width}
          >
            <div key="hero">
              <CardShell
                id="hero"
                isEditing={isEditing}
                mode={modes.hero}
                title="GitHub profile"
                className={styles.heroCard}
              >
            <div className={styles.heroHeader}>
              <span className={styles.heroTag}>GitHub profile</span>
              <span className={styles.heroIndex}>01</span>
            </div>

            <div className={styles.heroBody}>
              <div className={styles.profileLockup}>
                <Image
                  alt={`${siteProfile.handle} GitHub avatar`}
                  className={styles.avatar}
                  height={88}
                  priority
                  src={siteProfile.githubAvatar}
                  unoptimized
                  width={88}
                />
                <div>
                  <p className={styles.profileKicker}>{siteProfile.role}</p>
                  <h1 className={`${styles.title} ${styles.compactTitle}`}>{siteProfile.handle}</h1>
                </div>
              </div>

              <AnimatePresence initial={false} mode="wait">
                {modes.hero !== "compact" ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.heroExpandedBlock}
                    exit={{ opacity: 0, y: 8 }}
                    initial={{ opacity: 0, y: 8 }}
                    key="hero-copy"
                    transition={{ duration: 0.24 }}
                  >
                    <p className={styles.heroStatement}>{siteProfile.intro}</p>

                    <div className={styles.focusStrip} aria-label="当前方向">
                      <span>AI Agent</span>
                      <span>前后端系统</span>
                      <span>自动化工具</span>
                    </div>

                    <div className={styles.heroActions} aria-label="首页主要入口">
                      <Link className={styles.primaryAction} href="/work">
                        查看代表项目
                        <ArrowUpRight size={16} />
                      </Link>
                      <Link className={styles.secondaryAction} href={`/notes?note=${latestNotes[0]?.slug ?? ""}`}>
                        阅读工程笔记
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {modes.hero === "expanded" ? (
                <div className={styles.repoExhibit}>
                  {featuredRepos.map((repo) => (
                    <Link
                      className={styles.repoPanel}
                      href={repo.href}
                      key={repo.name}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className={styles.repoHead}>
                        <strong>{repo.name}</strong>
                        <small>{repo.language}</small>
                      </span>
                      <p>{repo.description}</p>
                      <ArrowUpRight size={16} />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            </CardShell>
          </div>

            <div key="project">
              <CardShell
                id="project"
                isEditing={isEditing}
                mode={modes.project}
                title="Featured work"
                className={styles.projectCard}
              >
            <div className={styles.projectBody}>
              <div>
                <p className={styles.eyebrow}>Featured work</p>
                <h2 className={styles.projectTitle}>{featuredWork.title}</h2>
                <p className={styles.cardCopy}>{featuredWork.summary}</p>

                <div className={styles.projectFactGrid} aria-label="作品概览">
                  <span>
                    <strong>用途</strong>
                    {featuredWork.tag === "Profile" ? "个人主页" : "Agent 工作台"}
                  </span>
                  <span>
                    <strong>技术栈</strong>
                    {featuredWork.stack?.slice(0, 2).join(" / ") || featuredWork.tag}
                  </span>
                  <span>
                    <strong>状态</strong>
                    {featuredWork.updatedAt ? `${featuredWork.updatedAt} 更新` : featuredWork.year}
                  </span>
                </div>

                <AnimatePresence initial={false} mode="wait">
                  {modes.project !== "compact" ? (
                    <motion.ul
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.projectCapabilityList}
                      exit={{ opacity: 0, y: 8 }}
                      initial={{ opacity: 0, y: 8 }}
                      key={`project-${modes.project}`}
                      transition={{ duration: 0.24 }}
                    >
                      {featuredWork.highlights?.slice(0, modes.project === "expanded" ? 3 : 2).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </motion.ul>
                  ) : null}
                </AnimatePresence>

                {modes.project === "expanded" ? (
                  <div className={styles.stackPills} aria-label="项目技术栈">
                    {featuredWork.stack?.slice(0, 5).map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              {modes.project !== "compact" ? (
                <div className={styles.projectFooter}>
                  <span>{featuredWork.year}</span>
                  <div className={styles.projectActions}>
                    <button
                      aria-expanded={isProjectDetailsOpen}
                      className={styles.projectDetailToggle}
                      onClick={() => setIsProjectDetailsOpen((current) => !current)}
                      type="button"
                    >
                      {isProjectDetailsOpen ? "收起说明" : "展开说明"}
                      <ChevronDown aria-hidden="true" className={isProjectDetailsOpen ? styles.chevronOpen : ""} size={15} />
                    </button>
                    <Link className={styles.inlineAction} href="/work">
                      进入作品页
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <AnimatePresence>
              {isProjectDetailsOpen && modes.project !== "compact" ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.projectDetailPanel}
                  exit={{ opacity: 0, y: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  role="dialog"
                  aria-label={`${featuredWork.title} 项目说明`}
                >
                  <div className={styles.projectDetailPanelHead}>
                    <span>项目说明</span>
                    <button
                      className={styles.inlineAction}
                      onClick={() => setIsProjectDetailsOpen(false)}
                      type="button"
                    >
                      收起 ×
                    </button>
                  </div>
                  <p>{featuredWork.detail}</p>
                  {featuredWork.github ? (
                    <a className={styles.inlineAction} href={featuredWork.github} rel="noreferrer" target="_blank">
                      查看仓库 <ArrowUpRight size={15} />
                    </a>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
              </CardShell>
            </div>

            <div key="about">
              <CardShell id="about" isEditing={isEditing} mode={modes.about} title="关于我" className={styles.techCard}>
            <div className={styles.aboutCardInner}>
              {modes.about !== "compact" ? (
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.eyebrow}>About me</p>
                    <h3 className={styles.cardTitle}>关于我</h3>
                  </div>
                  <span className={styles.iconFrame}>
                    <Sparkles size={18} />
                  </span>
                </div>
              ) : null}

              <AboutMeReveal density={modes.about} interactive={!isEditing} variant="card" />
            </div>
              </CardShell>
            </div>

            <div key="contact">
              <CardShell
                id="contact"
                isEditing={isEditing}
                mode={modes.contact}
                title="联系方式"
                className={styles.socialCard}
              >
                <div
                  className={styles.contactStage}
                  data-active={Boolean(activeQrItem)}
                  onMouseLeave={() => {
                    if (!isTouchLike) {
                      setActiveQr(null);
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.eyebrow}>Contact</p>
                      <h3 className={styles.cardTitle}>联系方式</h3>
                    </div>
                  </div>

                  <div className={styles.socialGrid}>
                    {contactLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          className={styles.socialLink}
                          href={item.href}
                          key={item.label}
                          rel={item.external ? "noreferrer" : undefined}
                          target={item.external ? "_blank" : undefined}
                          title={item.label}
                        >
                          <span className={styles.socialIcon}>
                            <Icon size={18} />
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    {qrItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeQr === item.id;

                      return (
                        <button
                          className={`${styles.socialLink} ${styles.qrAction} ${
                            isActive ? styles.qrActionActive : ""
                          }`}
                          data-qr-action="true"
                          aria-expanded={isActive}
                          key={item.id}
                          onClick={() => {
                            if (isTouchLike) {
                              setActiveQr((current) => (current === item.id ? null : item.id));
                              return;
                            }

                            setActiveQr(item.id);
                          }}
                          onMouseEnter={() => {
                            if (!isTouchLike) {
                              setActiveQr(item.id);
                            }
                          }}
                          title={item.label}
                          type="button"
                        >
                          <span className={styles.socialIcon}>
                            <Icon size={18} />
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {activeQrItem ? (
                      <motion.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={styles.contactQrLayer}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        key={activeQrItem.id}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Image
                          alt={activeQrItem.qrAlt}
                          className={styles.qrImage}
                          height={260}
                          loading="lazy"
                          sizes="260px"
                          src={activeQrItem.qrSrc}
                          width={260}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </CardShell>
            </div>

            <div key="notes">
              <CardShell
                id="notes"
                isEditing={isEditing}
                mode={modes.notes}
                title="最近笔记"
                className={styles.notesCard}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.eyebrow}>Latest notes</p>
                    <h3 className={styles.cardTitle}>最近笔记</h3>
                  </div>
                  <span className={styles.iconFrame}>
                    <Inbox size={18} />
                  </span>
                </div>

                <div className={styles.noteExhibit}>
                  {latestNotes.map((note) => (
                    <Link className={styles.notePanelLink} href={`/notes?note=${note.slug}`} key={note.slug}>
                      <article className={styles.notePanel}>
                        <p className={styles.noteFormat}>{note.format}</p>
                        <h3 className={styles.noteTitle}>{note.shortTitle}</h3>
                        {modes.notes === "expanded" ? <p className={styles.noteSummary}>{note.summary}</p> : null}
                      </article>
                    </Link>
                  ))}
                  <Link className={styles.inlineAction} href="/notes">
                    查看全部笔记
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </CardShell>
            </div>
          </Responsive>
        ) : null}
      </div>

      <button
        aria-pressed={isEditing}
        className={`${styles.editModeButton} ${isEditing ? styles.editModeButtonActive : ""}`}
        onClick={toggleEditing}
        title={isEditing ? "退出编辑" : "编辑布局"}
        type="button"
      >
        <PencilLine size={19} />
        <span>{isEditing ? "完成" : "编辑"}</span>
      </button>
    </section>
  );
}
