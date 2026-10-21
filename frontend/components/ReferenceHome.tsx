"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { notes, siteProfile } from "@/lib/site-content";
import styles from "./ReferenceHome.module.css";
import OpeningReveal from "./OpeningReveal";
import WorkExperience from "./WorkExperience";
import ReferenceChrome from "./ReferenceChrome";
import LifeNotesExperience from "./LifeNotesExperience";
import { useSiteMode } from "./ThemeProvider";

const lifeTags = ["日常片刻", "漫画与游戏", "随手记录"] as const;
const workTags = ["AI Agent", "全栈开发", "持续创造"] as const;
const featuredNotes = notes.slice(0, 4);
// Neutomni's four overlapping cover tracks finish at these progress points.
const noteCoverEnds = [.3, .45, .6, .75];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function idealVertices(count: number, radius: number) {
  const vertices = new Float64Array(count * 2);
  for (let index = 0; index < count; index += 1) {
    const angle = Math.PI / 2 + (2 * Math.PI * index) / count;
    vertices[index * 2] = Math.cos(angle) * radius;
    vertices[index * 2 + 1] = Math.sin(angle) * radius;
  }
  return vertices;
}

function alignedIdealVertices(count: number, radius: number, referenceX: number, referenceY: number) {
  const raw = idealVertices(count, radius);
  const referenceAngle = Math.atan2(referenceY, referenceX);
  let bestOffset = 0;
  let bestDifference = Infinity;
  for (let offset = 0; offset < count; offset += 1) {
    const angle = Math.atan2(raw[offset * 2 + 1], raw[offset * 2]);
    let difference = Math.abs(angle - referenceAngle);
    if (difference > Math.PI) difference = 2 * Math.PI - difference;
    if (difference < bestDifference) {
      bestDifference = difference;
      bestOffset = offset;
    }
  }
  const aligned = new Float64Array(count * 2);
  for (let index = 0; index < count; index += 1) {
    const source = ((index + bestOffset) % count) * 2;
    aligned[index * 2] = raw[source];
    aligned[index * 2 + 1] = raw[source + 1];
  }
  return aligned;
}

function continuousVertices(vertexCount: number, radius: number) {
  const lowerCount = Math.floor(vertexCount);
  const fraction = vertexCount - lowerCount;
  if (fraction < 1e-9) return idealVertices(lowerCount, radius);

  const upperCount = Math.min(12, lowerCount + 1);
  const lower = idealVertices(lowerCount, radius);
  const inserted = new Float64Array(upperCount * 2);
  inserted[0] = lower[0];
  inserted[1] = lower[1];
  inserted[2] = (lower[0] + lower[2]) / 2;
  inserted[3] = (lower[1] + lower[3]) / 2;
  for (let index = 2; index < upperCount; index += 1) {
    inserted[index * 2] = lower[(index - 1) * 2];
    inserted[index * 2 + 1] = lower[(index - 1) * 2 + 1];
  }
  const upper = alignedIdealVertices(upperCount, radius, lower[0], lower[1]);
  const result = new Float64Array(upperCount * 2);
  for (let index = 0; index < result.length; index += 1) {
    result[index] = lerp(inserted[index], upper[index], fraction);
  }
  return result;
}

function drawProcessRoad(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number, color: string) {
  const clampedProgress = clamp(progress, 0, 1);
  const radius = Math.min(width, height) * 0.13;
  const xLeft = -radius;
  const xRight = width - radius;
  const span = xRight - xLeft;
  const entry = (2 * radius) / span;
  const wheelX = lerp(xLeft, xRight, clampedProgress);
  const morph = easeInOut(Math.min(1, Math.max(0, (clampedProgress - entry) / (1 - entry))));
  const polygonProgress = Math.min(morph / 0.3, 1);
  const circleProgress = easeInOut(Math.max(0, (morph - 0.3) / 0.7));
  const fractionalSides = 4 + polygonProgress * 8;
  const lowerSides = Math.floor(fractionalSides);
  const upperSides = Math.min(12, lowerSides + 1);
  const sideFraction = fractionalSides - lowerSides;
  const sideLength = lerp(
    2 * radius * Math.sin(Math.PI / lowerSides),
    2 * radius * Math.sin(Math.PI / upperSides),
    sideFraction
  );
  const apothem = lerp(
    radius * Math.cos(Math.PI / lowerSides),
    radius * Math.cos(Math.PI / upperSides),
    sideFraction
  );
  const roadPeakY = (height - 360) * 0.5 + apothem;
  const axleY = roadPeakY - (apothem + (radius - apothem) * circleProgress);
  const vertices = continuousVertices(fractionalSides, radius);
  const vertexTotal = vertices.length / 2;
  const rotation = (clampedProgress * span / sideLength) * (2 * Math.PI / fractionalSides) - Math.PI / fractionalSides;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const firstPeakX = xLeft + Math.ceil((-xLeft - sideLength) / sideLength) * sideLength;
  const archCount = Math.ceil((width + sideLength * 2) / sideLength) + 2;
  const steps = Math.max(48, Math.round(sideLength));
  ctx.beginPath();
  for (let arch = 0; arch < archCount; arch += 1) {
    const peakX = firstPeakX + arch * sideLength;
    const archLeft = peakX - sideLength / 2;
    for (let step = 0; step <= steps; step += 1) {
      const fraction = step / steps;
      const localX = archLeft + fraction * sideLength - peakX;
      const catenaryY = roadPeakY + apothem * Math.cosh(localX / apothem) - apothem;
      const y = catenaryY * (1 - circleProgress) + roadPeakY * circleProgress;
      if (step === 0) ctx.moveTo(archLeft, y);
      else ctx.lineTo(archLeft + fraction * sideLength, y);
    }
  }
  ctx.stroke();

  ctx.save();
  ctx.translate(wheelX, axleY);
  ctx.rotate(rotation);
  ctx.beginPath();
  if (circleProgress < 0.999) {
    const samples = 360;
    for (let sample = 0; sample <= samples; sample += 1) {
      const vertexPosition = (sample * vertexTotal) / samples;
      const vertexIndex = Math.floor(vertexPosition) % vertexTotal;
      const nextIndex = (vertexIndex + 1) % vertexTotal;
      const localFraction = vertexPosition - Math.floor(vertexPosition);
      const x = lerp(vertices[vertexIndex * 2], vertices[nextIndex * 2], localFraction);
      const y = lerp(vertices[vertexIndex * 2 + 1], vertices[nextIndex * 2 + 1], localFraction);
      const pointRadius = Math.sqrt(x * x + y * y);
      const scale = lerp(pointRadius, radius, circleProgress) / pointRadius;
      if (sample === 0) ctx.moveTo(x * scale, y * scale);
      else ctx.lineTo(x * scale, y * scale);
    }
    ctx.closePath();
  } else {
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.moveTo(0, axleY);
  ctx.lineTo(width, axleY);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function scrollToStoryIndex(container: HTMLElement | null, index: number, count: number, stops?: number[], onComplete?: () => void) {
  if (!container || count < 2) {
    onComplete?.();
    return;
  }
  const stage = container.querySelector<HTMLElement>("[data-scroll-story-stage]");
  const travel = Math.max(0, container.offsetHeight - (stage?.offsetHeight ?? window.innerHeight));
  const start = window.scrollY + container.getBoundingClientRect().top;
  const progress = stops?.[index] ?? index / (count - 1);
  const target = start + travel * progress;
  if (Math.abs(target - window.scrollY) < 2) {
    onComplete?.();
    return;
  }
  if (window.__zfyLenis) window.__zfyLenis.scrollTo(target, { duration: 0.55, onComplete });
  else {
    window.scrollTo({ top: target, behavior: "smooth" });
    if (onComplete) window.setTimeout(onComplete, 700);
  }
}

export default function ReferenceHome(){
  const rootRef=useRef<HTMLDivElement>(null);
  const workJourneyRef=useRef<HTMLDivElement>(null);
  const processCanvasRef=useRef<HTMLCanvasElement>(null);
  const activeWorkIndexRef=useRef(0);
  const { mode } = useSiteMode();
  const isWorkMode=mode==="work";
  const identityTags=isWorkMode?workTags:lifeTags;
  const [time,setTime]=useState("");
  const [processDesktop,setProcessDesktop]=useState(false);
  const [activeWorkIndex,setActiveWorkIndex]=useState(0);
  const changeWorkIndex=(index:number)=>{
    const previous=activeWorkIndexRef.current;
    if(previous===index)return;
    activeWorkIndexRef.current=index;
    setActiveWorkIndex(index);
  };
  useEffect(()=>{
    const media=window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    const sync=()=>setProcessDesktop(media.matches);
    sync();
    media.addEventListener("change",sync);
    return()=>media.removeEventListener("change",sync);
  },[]);
  useEffect(()=>{
    if(!isWorkMode||!processDesktop)return;
    const container=workJourneyRef.current;
    const canvas=processCanvasRef.current;
    const context=canvas?.getContext("2d");
    if(!container||!canvas||!context)return;
    let width=0;
    let height=0;
    let pixelRatio=1;
    let targetProgress=0;
    let renderedProgress=0;
    let targetCoverProgress=0;
    let renderedCoverProgress=0;
    let initialized=false;
    let frame=0;
    const onScreenProgress=()=>{
      const travel=Math.max(1,container.offsetHeight-window.innerHeight);
      const start=window.scrollY+container.getBoundingClientRect().top;
      const raw=clamp((window.scrollY-start)/travel,0,1);
      targetCoverProgress=raw;
      targetProgress=clamp((raw-.25)/.75,0,1);
      if(!initialized){renderedProgress=targetProgress;renderedCoverProgress=raw;initialized=true;}
      if(!frame)frame=requestAnimationFrame(render);
    };
    const resize=()=>{
      const bounds=canvas.getBoundingClientRect();
      width=bounds.width;
      height=bounds.height;
      pixelRatio=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.max(1,Math.round(width*pixelRatio));
      canvas.height=Math.max(1,Math.round(height*pixelRatio));
      context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
      onScreenProgress();
    };
    const render=()=>{
      renderedProgress=lerp(renderedProgress,targetProgress,.2);
      renderedCoverProgress=lerp(renderedCoverProgress,targetCoverProgress,.2);
      if(Math.abs(targetProgress-renderedProgress)<.0005)renderedProgress=targetProgress;
      if(Math.abs(targetCoverProgress-renderedCoverProgress)<.0005)renderedCoverProgress=targetCoverProgress;
      drawProcessRoad(context,width,height,renderedProgress,"#fff");
      const covers=Array.from(container.querySelectorAll<HTMLElement>("[data-process-cover]"));
      covers.forEach((cover,index)=>{
        const progress=clamp(renderedCoverProgress/noteCoverEnds[index],0,1);
        cover.style.setProperty("--process-cover-progress",String(progress));
      });
      if(Math.abs(targetProgress-renderedProgress)>.0005||Math.abs(targetCoverProgress-renderedCoverProgress)>.0005)frame=requestAnimationFrame(render);
      else frame=0;
    };
    window.addEventListener("scroll",onScreenProgress,{passive:true});
    window.addEventListener("resize",resize);
    resize();
    return()=>{
      window.removeEventListener("scroll",onScreenProgress);
      window.removeEventListener("resize",resize);
      if(frame)cancelAnimationFrame(frame);
    };
  },[isWorkMode,processDesktop]);
  useEffect(()=>{
    const root=rootRef.current;if(!root)return;
    const revealNodes=Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    let raf=0;
    const workStops=noteCoverEnds;
    const updateWorkStory=(container:HTMLDivElement|null)=>{
      if(!container||container.offsetHeight===0)return;
      if(window.matchMedia("(max-width: 900px)").matches){
        const track=container.querySelector<HTMLElement>("[data-process-track]");
        if(track)track.style.transform="none";
        const cards=Array.from(container.querySelectorAll<HTMLElement>("[data-process-card]"));
        cards.forEach((card)=>{card.style.height="";});
        const midpoint=window.innerHeight*.54;
        let nearest=0;
        let nearestDistance=Infinity;
        cards.forEach((card,index)=>{
          const rect=card.getBoundingClientRect();
          const distance=Math.abs((rect.top+rect.bottom)/2-midpoint);
          if(distance<nearestDistance){nearestDistance=distance;nearest=index;}
        });
        changeWorkIndex(nearest);
        return;
      }
      const trackViewport=container.querySelector<HTMLElement>("[data-process-viewport]");
      const track=container.querySelector<HTMLElement>("[data-process-track]");
      const cards=Array.from(container.querySelectorAll<HTMLElement>("[data-process-card]"));
      if(!trackViewport||!track||cards.length===0)return;
      const travel=Math.max(0,container.offsetHeight-window.innerHeight);
      const start=window.scrollY+container.getBoundingClientRect().top;
      const progress=travel?clamp((window.scrollY-start)/travel,0,1):0;
      track.style.transform="none";
      const stageIndex=noteCoverEnds.reduce((current,stop,index)=>progress>=stop-.001?index:current,0);
      changeWorkIndex(stageIndex);
    };
    const measure=()=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        revealNodes.forEach((node,index)=>{
          const rect=node.getBoundingClientRect();
          node.dataset.revealDirection=String(index%4);
          node.style.transitionDelay=`${(index%4)*65}ms`;
          node.dataset.visible=rect.top<innerHeight*.93&&rect.bottom>0?"true":"false";
        });
        updateWorkStory(workJourneyRef.current);
      });
    };
    const handleScroll=()=>{
      measure();
    };
    const handleStoryKey=(event:KeyboardEvent)=>{
      if(!isWorkMode||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target;
      if(target instanceof HTMLElement&&target.closest("input,textarea,select,[contenteditable='true'],[role='tab']"))return;
      const direction=event.key==="PageDown"||event.key==="ArrowDown"||event.key===" "?1:event.key==="PageUp"||event.key==="ArrowUp"?-1:0;
      if(!direction)return;
      const routeTo=(container:HTMLDivElement|null,count:number,index:number)=>{
        if(!container||container.offsetHeight===0||count<2)return false;
        const rect=container.getBoundingClientRect();
        if(rect.top>window.innerHeight*.45||rect.bottom<window.innerHeight*.55)return false;
        const next=Math.max(0,Math.min(count-1,index+direction));
        if(next===index)return false;
        event.preventDefault();
        scrollToStoryIndex(container,next,count,workStops);
        return true;
      };
      if(routeTo(workJourneyRef.current,featuredNotes.length,activeWorkIndexRef.current))return;
    };
    window.addEventListener("zfy:navigation-settled",measure);
    window.addEventListener("scroll",handleScroll,{passive:true});
    window.addEventListener("resize",measure);
    window.addEventListener("keydown",handleStoryKey);
    measure();
    const clock=()=>setTime(new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Shanghai"}).format(new Date()));clock();const interval=setInterval(clock,30000);
    return()=>{window.removeEventListener("zfy:navigation-settled",measure);window.removeEventListener("scroll",handleScroll);window.removeEventListener("resize",measure);window.removeEventListener("keydown",handleStoryKey);if(raf)cancelAnimationFrame(raf);clearInterval(interval);};
  },[isWorkMode]);
  return <div ref={rootRef} className={styles.page} id="top">
    <ReferenceChrome home />
    <div className={styles.watermark} aria-hidden="true" data-home-chrome><span>zi</span><span>feiyu</span></div>
    <section className={styles.hero} aria-label="子非鱼">
      <OpeningReveal/>
      <div className={styles.heroForeground}>
        <div className={styles.identity} data-home-identity>
          <p className={styles.meta}>{isWorkMode?"WORK / APPLIED AI":"PERSONAL WEBSITE"}</p>
          <h1>子非鱼</h1>
          <ul className={styles.identityTags} aria-label="方向标签">
            {identityTags.map(tag => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        <p className={styles.revealHint} aria-label="移动指针或触摸拖动，看看我的世界" data-home-chrome><span className={styles.mouseHint} aria-hidden="true">移动鼠标，看看我的世界</span><span className={styles.touchHint} aria-hidden="true">触摸拖动，看看我的世界</span></p>
      </div>
    </section>
    <section className={styles.intro} id="about" aria-label={isWorkMode?"工作介绍":"生活介绍"}>
      <div className={styles.introGrid}>
        <p className={styles.introEyebrow}>{isWorkMode?"WORK / SELECTED PROJECTS":"LIFE / EVERYDAY NOTES"}</p>
        {isWorkMode?<>
          <h2 className={`${styles.big} ${styles.introTitle}`}><span data-reveal>Build AI Agents</span><span data-reveal>&amp; Tools for</span><span data-reveal>the real world.</span></h2>
          <p className={styles.introCopy} data-reveal>我是子非鱼，做 AI Agent 和全栈产品，关注 Agent 怎么从演示走进真实工作流。最近在做 ClaimCourt 本地证据工作台、Super Agent 工作台和 InterviewPilot AI 面试教练，也在探索让 AI 设计任务自然进入画布的产品形态。我会持续记录 Agent 落地时的工程问题：任务怎样定义、结果怎样验证、失败后怎样恢复。</p>
          <h2 className={`${styles.big} ${styles.statement}`}><span data-reveal>Ideas become</span><span data-reveal>working systems.</span></h2>
        </>:<>
          <h2 className={`${styles.big} ${styles.introTitle}`}><span data-reveal>Some moments</span><span data-reveal>are worth</span><span data-reveal>keeping.</span></h2>
          <p className={styles.introCopy} data-reveal>这里收着一些日常片刻：窗边的秋色、漫画店里的墙、喜欢的书和游戏里的收藏，也有一顿认真吃过的饭。生活不必被整理成履历，先把想记住的瞬间留下来。</p>
          <h2 className={`${styles.big} ${styles.statement}`}><span data-reveal>A little life,</span><span data-reveal>as it happens.</span></h2>
        </>}
        <span className={styles.copyright}>© ’26</span>
      </div>
    </section>
    <section className={styles.work} id={isWorkMode?"notes":"work-notes"} aria-label="工程笔记" hidden={!isWorkMode}>
      <div className={styles.workShell}>
        <header className={styles.workHeading}>
          <p className={styles.workEyebrow}>WORK / FIELD NOTES</p>
          <h2 className={styles.workTitle}>Notes <em>& Thoughts</em></h2>
          <p className={styles.workIntro}>记录 Agent 走进真实工作流时，遇到的问题、做过的取舍和留下的方法。</p>
          <Link className={styles.workAll} href="/notes">All notes <span aria-hidden="true">↗</span></Link>
        </header>
        <div
          ref={workJourneyRef}
          className={styles.workJourney}
          style={{height:"500svh"} as CSSProperties}
        >
          <div className={styles.workSticky} data-scroll-story-stage="true">
            <div className={styles.processIntro}>
              <div className={styles.workRoute} data-process-route="true" aria-hidden="true">
                <span>A</span><span className={styles.workRouteArrow}>→</span><span>B</span>
              </div>
              <p className={styles.processIntroText}>从真实问题出发，<br/>把实践写成记录。</p>
              <span className={styles.processTitlePill}>Field Notes</span>
            </div>
            <canvas ref={processCanvasRef} className={styles.processCanvas} aria-hidden="true" />
            <div className={styles.processTrackViewport} data-process-viewport="true">
              <div className={styles.processTrack} data-process-track="true">
                {featuredNotes.map((note,index) => <article
                  className={styles.workCard}
                  data-process-card="true"
                  data-active={activeWorkIndex===index}
                  key={note.slug}
                >
                  <div className={styles.processCover} data-process-cover="true" aria-hidden="true" />
                  <div className={styles.processCardTop}><span>{String(index+1).padStart(2,"0")}</span></div>
                  <div className={styles.processCardCopy}>
                    <h3><Link href={`/notes?note=${note.slug}`}>{note.shortTitle}</Link><em>{note.format}</em></h3>
                    <p>{note.summary}</p>
                    <Link className={styles.processRead} href={`/notes?note=${note.slug}`}>阅读笔记 <span aria-hidden="true">↗</span></Link>
                  </div>
                </article>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className={styles.notes} id={isWorkMode?"work":"notes"} aria-label={isWorkMode?"真实项目":"生活笔记"}>
      <h2 className={`${styles.big} ${styles.notesTitle}`}>{isWorkMode?<><span data-reveal>Selected</span><span data-reveal>Work</span></>:<><span data-reveal>Life</span><span data-reveal>&amp;</span><span data-reveal>Notes</span></>}</h2>
      {isWorkMode?<>
        <WorkExperience/>
        <Link className={styles.allNotes} href="/work">All projects ↗</Link>
      </>:<LifeNotesExperience/>}
    </section>
    <footer className={styles.footer} id="contact">
      <div className={styles.footerGrid}>
        <h2 className={`${styles.big} ${styles.footerPhrase}`}><span data-reveal>Everything</span><span data-reveal>starts with</span></h2>
        <h2 className={`${styles.big} ${styles.footerPhraseTwo}`}><span data-reveal>an idea.</span><span data-reveal>Let’s make</span><span data-reveal>it real.</span></h2>
        <div className={styles.clock} data-reveal aria-label="北京时间">({time||"--:--"})<small>SHANGHAI TIME</small></div>
        <div className={styles.socials}>
          <a href={siteProfile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          <button>微信 ↗<span className={styles.contactPreview}><Image unoptimized src="/contact/wechat-green.png" alt="微信联系方式" width={250} height={380}/></span></button>
          <button>QQ ↗<span className={styles.contactPreview}><Image unoptimized src="/contact/qq-red.png" alt="QQ 联系方式" width={250} height={380}/></span></button>
        </div>
        <div className={styles.contactCopy}><p>保持联系<br/>继续创造</p>{siteProfile.email&&<a className={styles.email} href={`mailto:${siteProfile.email}`}>{siteProfile.email} ↗</a>}</div>
      </div>
      <div className={styles.footerLogo} aria-label="子非鱼"><span>zi</span><span>feiyu</span></div>
      <div className={styles.footerFine}><span>子非鱼 ’26 ©</span><span>Personal website</span><a href="#top">Back to top ↑</a></div>
    </footer>
  </div>;
}
