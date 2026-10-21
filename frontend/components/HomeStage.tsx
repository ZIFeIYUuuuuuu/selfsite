"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Mail } from "lucide-react";
import { notes, selectedWork, siteProfile } from "@/lib/site-content";
import styles from "./HomeStage.module.css";
import OpeningScene from "./OpeningScene";

const workScreenshots: Record<string, string> = {
  "super-agent": "/work/super-agent.png",
  "interviewpilot-ai": "/work/interviewpilot-ai.png",
};
const contactCards = [
  { label: "QQ", src: "/contact/qq-red.png", alt: "QQ 联系方式" },
  { label: "微信", src: "/contact/wechat-green.png", alt: "微信联系方式" },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export default function HomeStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const workRailRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let scheduleRender = () => {};
    const onScroll = () => {
      const rect = stage.getBoundingClientRect();
      const distance = Math.max(stage.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / distance);
      scrollRef.current = progress;
      scheduleRender();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const render = () => {
      frameRef.current = 0;
      const progress = scrollRef.current;
      stage.style.setProperty("--stage-progress", String(progress));
      const openingExit = smooth((progress - 0.30) / 0.105);
      stage.style.setProperty("--opening-opacity", String(1 - openingExit));
      stage.style.setProperty("--opening-y", `${-openingExit * 35}px`);
      stage.style.setProperty("--opening-events", progress < .39 ? "auto" : "none");
      stage.style.setProperty("--opening-visibility", progress >= .405 ? "hidden" : "visible");
      const pAbout = smooth((progress - 0.405) / 0.025) * (1 - smooth((progress - 0.585) / 0.025));
      const pWork = smooth((progress - 0.625) / 0.025) * (1 - smooth((progress - 0.79) / 0.025));
      const pNotes = smooth((progress - 0.825) / 0.02) * (1 - smooth((progress - 0.91) / 0.02));
      const pContact = smooth((progress - 0.935) / 0.025);
      const setStage = (element: HTMLDivElement | null, opacity: number, y = 30) => {
        if (!element) return;
        element.style.opacity = String(opacity);
        element.style.transform = `translate3d(0, ${(1 - opacity) * y}px, 0)`;
        element.style.pointerEvents = opacity > 0.35 ? "auto" : "none";
        element.setAttribute("aria-hidden", String(opacity < 0.08));
      };
      setStage(aboutRef.current, pAbout);
      setStage(workRef.current, pWork);
      setStage(notesRef.current, pNotes);
      setStage(contactRef.current, pContact);
      if (workRailRef.current) {
        const railProgress = clamp((progress - 0.65) / 0.17);
        workRailRef.current.style.transform = `translate3d(${-railProgress * 64}%, 0, 0)`;
      }

    };
    scheduleRender = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(render);
    };
    scheduleRender();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.scrollStage} data-home-stage>
      <div className={styles.stickyViewport}>
        <div className={styles.identity}>
          <Link className={styles.identityName} href="/" aria-label="子非鱼首页">{siteProfile.name}</Link>
          <p className={styles.identityBio} />
          <ul className={styles.identityTagRow}>
            {["AI Agent", "全栈开发", "持续创造"].map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>

        <OpeningScene />

        <div className={styles.stageProgress} aria-hidden="true"><span /></div>
        <span className={styles.stageHint}><ArrowDownRight size={16} /> 滚动继续</span>

        <section ref={aboutRef} className={`${styles.scene} ${styles.aboutScene}`} aria-label="About">
          <p className={styles.sceneEyebrow}>01 / ABOUT</p>
          <h2 className={styles.aboutHeadline}><span>让想法</span><span>变成正在运行的系统</span></h2>
          <p className={styles.aboutSubline}>Applied AI · Agents · Tools</p>
          <a className={styles.aboutLink} href="https://zifeiyu.cc/#about" target="_blank" rel="noreferrer">
            前往 zifeiyu.cc 关于我 <ArrowUpRight size={16} />
          </a>
        </section>

        <section ref={workRef} className={`${styles.scene} ${styles.workScene}`} aria-label="作品">
          <div className={styles.sceneHeader}><p className={styles.sceneEyebrow}>02 / SELECTED WORK</p><span>横向浏览项目</span></div>
          <div className={styles.workViewport}>
            <div ref={workRailRef} className={styles.workRail}>
              {selectedWork.filter((item) => workScreenshots[item.title.toLowerCase()]).map((item, index) => (
                <article className={styles.workTile} key={item.title}>
                  <div className={styles.workVisual}>
                    {workScreenshots[item.title.toLowerCase()] ? <Image src={workScreenshots[item.title.toLowerCase()]} alt={`${item.title} 项目实际页面截图`} fill sizes="(max-width: 700px) 76vw, 430px" /> : null}
                    <div className={styles.workVisualCaption}>
                      <span className={styles.workIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{item.title}</strong>
                      <span className={styles.workTag}>{item.tag}</span>
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {item.github && <a href={item.github} target="_blank" rel="noreferrer">查看项目 <ArrowUpRight size={14} /></a>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section ref={notesRef} className={`${styles.scene} ${styles.notesScene}`} aria-label="Notes">
          <p className={styles.sceneEyebrow}>03 / NOTES</p>
          <h2>记录过程，也记录判断。</h2>
          <div className={styles.noteList}>
            {notes.slice(0, 3).map((note, index) => (
              <a key={note.slug} href={`/notes?note=${note.slug}`} className={styles.noteRow}>
                <span>{String(index + 1).padStart(2, "0")} / {note.format}</span><strong>{note.shortTitle}</strong><ArrowUpRight size={15} />
              </a>
            ))}
          </div>
        </section>

        <section ref={contactRef} className={`${styles.scene} ${styles.contactScene}`} aria-label="Contact">
          <p className={styles.sceneEyebrow}>04 / CONTACT</p>
          <h2>保持联系。</h2>
          <div className={styles.contactRow}>
            {contactCards.map((card) => (
              <div className={styles.contactCard} key={card.label} tabIndex={0}>
                <span>{card.label}</span>
                <div className={styles.contactPreview}><Image src={card.src} alt={card.alt} width={330} height={520} /></div>
              </div>
            ))}
            <a className={styles.contactCard} href={siteProfile.github} target="_blank" rel="noreferrer"><ArrowUpRight size={19} /><span>GitHub</span></a>
            {siteProfile.email && <a className={styles.contactCard} href={`mailto:${siteProfile.email}`}><Mail size={19} /><span>Email</span></a>}
          </div>
        </section>
      </div>
      <div className={styles.afterword}>
        <p>子非鱼 <span>·</span> Applied AI / Agent Builder</p>
        <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>回到顶部 ↑</a>
      </div>
    </div>
  );
}
