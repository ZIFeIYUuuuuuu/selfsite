"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import HomeMenu from "./HomeMenu";
import { ModeToggle, useSiteMode } from "./ThemeProvider";
import styles from "./ReferenceHome.module.css";

export default function ReferenceChrome({ home = false }: { home?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { mode } = useSiteMode();
  const close = useCallback(() => setOpen(false), []);
  return <>
    <Link href={home ? "#top" : "/#notes"} className={styles.cornerMark} aria-label={home ? "子非鱼首页" : "返回首页笔记"} data-home-chrome><span /></Link>
    <div className={styles.topControls} data-home-chrome data-menu-controls>
      <ModeToggle className={styles.homeModeToggle} />
      <button ref={trigger} className={styles.menuButton} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="reference-menu">{open ? "Close" : "Menu"}</button>
    </div>
    <HomeMenu open={open} work={mode === "work"} triggerRef={trigger} onClose={close} home={home} />
  </>;
}
