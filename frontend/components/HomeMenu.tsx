"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import { useSiteNavigation } from "./NavigationProvider";
import styles from "./HomeMenu.module.css";

type MenuProps = {
  open: boolean;
  home?: boolean;
  work: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

function MenuPanel({ work, home, onClose, navigate }: Omit<MenuProps, "open" | "triggerRef"> & { navigate: (hash: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const items = [
    { label: "Home", hash: "#top" },
    { label: work ? "Overview" : "Life", hash: "#about" },
    { label: "Notes", hash: "#notes" },
    ...(work ? [{ label: "Work", hash: "#work" }] : []),
    { label: "Contacts", hash: "#contact" },
  ];

  useEffect(() => {
    const overflow = document.body.style.overflow;
    const lenis = window.__zfyLenis;
    const wasStopped = lenis?.isStopped;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    const sections = Array.from(document.querySelectorAll<HTMLElement>("#top > section, #top > footer, #top > a, [data-note-page-content]"));
    const priorInert = sections.map(section => section.inert);
    sections.forEach(section => { section.inert = true; });
    ref.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      // Keep the underlying scroll stories from consuming keyboard input.
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) event.preventDefault();
      if (event.key !== "Tab") return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>("[data-menu-controls] button, #reference-menu a"));
      const current = controls.indexOf(document.activeElement as HTMLElement);
      const next = (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault();
      controls[next]?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", handleKey, true);
    return () => {
      window.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = overflow;
      sections.forEach((section, i) => { section.inert = priorInert[i]; });
      if (!wasStopped) lenis?.start();
    };
  }, [onClose]);

  return <motion.nav ref={ref} id="reference-menu" className={styles.menu} aria-label="站点导航" data-lenis-prevent
    initial="closed" animate="open" exit="exit"
    variants={{
      closed: { clipPath: "inset(0 0 100% 0)" },
      open: { clipPath: "inset(0 0 0% 0)", transition: { duration: reduced ? 0 : .65, ease: [.76, 0, .24, 1], delayChildren: reduced ? 0 : .16, staggerChildren: reduced ? 0 : .065 } },
      exit: { clipPath: "inset(0 0 100% 0)", transition: { duration: reduced ? 0 : .5, ease: [.76, 0, .24, 1], when: "afterChildren" } },
    }}>
    <div className={styles.links}>
      {items.map((item, index) => <div className={styles.row} key={item.hash}>
        <motion.a href={home ? item.hash : `/${item.hash}`} aria-label={item.label} className={styles.link}
          onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(item.hash); }}
          variants={{
            closed: { y: "110%", opacity: 0 },
            open: { y: "0%", opacity: 1, transition: { duration: reduced ? 0 : .75, ease: [.22, 1, .36, 1] } },
            exit: { y: "-30%", opacity: 0, transition: { duration: reduced ? 0 : .2 } },
          }}>
          <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
          <span className={styles.labelWindow} aria-hidden="true">
            <span className={styles.labelTrack}><span>{item.label}</span><span>{item.label}</span></span>
          </span>
          <span className={styles.arrow} aria-hidden="true">↗</span>
        </motion.a>
      </div>)}
    </div>
  </motion.nav>;
}

export default function HomeMenu(props: MenuProps) {
  const { navigate: changePage } = useSiteNavigation();
  const navigating = useRef(false);
  useEffect(() => { if (props.open) navigating.current = false; }, [props.open]);
  const navigate = (hash: string) => {
    navigating.current = true;
    props.onClose();
    void changePage(props.home ? hash : `/${hash}`);
  };
  return <AnimatePresence onExitComplete={() => {
    if (!navigating.current) props.triggerRef.current?.focus({ preventScroll: true });
  }}>
    {props.open && <MenuPanel key="menu" work={props.work} home={props.home} onClose={props.onClose} navigate={navigate} />}
  </AnimatePresence>;
}
