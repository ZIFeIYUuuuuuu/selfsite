"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./NavigationProvider.module.css";

declare global { interface Window { __zfyNavigating?: boolean; } }
type Pending = { href: string; restore: boolean; settling: boolean };
const NavigationContext = createContext({ navigate: (_href: string) => {}, commit: (_route: string) => {} });
export const useSiteNavigation = () => useContext(NavigationContext);
const address = () => location.pathname + location.search + location.hash;
const positionKey = (href: string) => `${document.documentElement.dataset.mode}:${href}`;
const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

function RouteObserver() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { commit } = useSiteNavigation();
  useEffect(() => { commit(pathname + (search.toString() ? `?${search}` : "")); }, [pathname, search, commit]);
  return null;
}

export default function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | null>(null);
  const positions = useRef(new Map<string, number>());
  const modes = useRef(new Map<string, string>());
  const previous = useRef("");
  const currentRoute = useRef("");
  const watchdog = useRef(0);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const release = useCallback(() => {
    window.clearTimeout(watchdog.current);
    window.__zfyNavigating = false;
    window.__zfyLenis?.start();
    document.documentElement.removeAttribute("data-navigating");
    pending.current = null;
  }, []);

  const settle = useCallback(async () => {
    const job = pending.current;
    if (!job || job.settling) return;
    job.settling = true;
    await frame(); await frame();
    if (pending.current !== job) return;
    const url = new URL(job.href, location.origin);
    window.__zfyLenis?.resize();
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
    let target: HTMLElement | null = null;
    if (url.hash) {
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { /* Invalid fragments fall back to the page top. */ }
    }
    const saved = job.restore ? positions.current.get(positionKey(job.href)) : undefined;
    const y = saved ?? (target ? target.getBoundingClientRect().top + window.scrollY : 0);
    if (window.__zfyLenis) window.__zfyLenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: "instant" });
    previous.current = job.href;
    window.dispatchEvent(new Event("zfy:navigation-settled"));
    await frame(); await frame();
    if (!reduced() && curtain.current) {
      // Finish the menu's exit behind the covered page, then reveal the destination.
      await new Promise<void>(resolve => gsap.to(curtain.current, { scaleY: 0, transformOrigin: "50% 0%", duration: .6, delay: .16, ease: "power3.inOut", onComplete: resolve }));
    } else gsap.set(curtain.current, { scaleY: 0 });
    if (pending.current === job) {
      const focus = (target?.querySelector("h1, h2") ?? document.querySelector("main h1")) as HTMLElement | null;
      if (focus) { focus.setAttribute("tabindex", "-1"); focus.focus({ preventScroll: true }); }
      release();
    }
  }, [release]);

  const commit = useCallback((route: string) => {
    currentRoute.current = route;
    const job = pending.current;
    if (job) {
      const url = new URL(job.href, location.origin);
      if (url.pathname + url.search === route) void settle();
    } else previous.current = address();
  }, [settle]);

  const navigate = useCallback(async (href: string) => {
    if (pending.current) return;
    const url = new URL(href, location.href);
    const next = url.pathname + url.search + url.hash;
    if (next === address() && !url.hash) return;
    positions.current.set(positionKey(address()), window.scrollY);
    modes.current.set(address(), document.documentElement.dataset.mode ?? "life");
    const job: Pending = { href: next, restore: false, settling: false };
    pending.current = job;
    window.__zfyNavigating = true;
    document.documentElement.dataset.navigating = "true";
    if (curtain.current) curtain.current.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--text");
    window.__zfyLenis?.stop();
    watchdog.current = window.setTimeout(() => { gsap.to(curtain.current, { scaleY: 0, duration: .2 }); release(); }, 6000);
    if (!reduced() && curtain.current) {
      await new Promise<void>(resolve => gsap.fromTo(curtain.current, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: .42, ease: "power3.inOut", onComplete: resolve }));
    }
    if (pending.current !== job) return;
    if (url.pathname === location.pathname && url.search === location.search) {
      if (next !== address()) history.pushState({ ...history.state }, "", next);
      void settle();
    } else {
      document.documentElement.dataset.zfyIntroSkip = "true";
      router.push(next, { scroll: false });
    }
  }, [router, release, settle]);

  useEffect(() => {
    previous.current = address();
    const priorRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download") || link.dataset.nativeNavigation !== undefined) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !["http:", "https:"].includes(url.protocol)) return;
      event.preventDefault();
      void navigate(url.pathname + url.search + url.hash);
    };
    const pop = () => {
      positions.current.set(positionKey(previous.current), window.scrollY);
      modes.current.set(previous.current, document.documentElement.dataset.mode ?? "life");
      gsap.killTweensOf(curtain.current);
      window.clearTimeout(watchdog.current);
      const job: Pending = { href: address(), restore: true, settling: false };
      pending.current = job;
      window.__zfyNavigating = true;
      window.__zfyLenis?.stop();
      document.documentElement.dataset.navigating = "true";
      if (curtain.current) curtain.current.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--text");
      gsap.set(curtain.current, { scaleY: reduced() ? 0 : 1 });
      watchdog.current = window.setTimeout(() => { gsap.set(curtain.current, { scaleY: 0 }); release(); }, 6000);
      const savedMode = modes.current.get(job.href);
      if (savedMode) window.dispatchEvent(new CustomEvent("zfy:restore-mode", { detail: savedMode }));
      if (currentRoute.current === location.pathname + location.search) void settle();
    };
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", pop);
      history.scrollRestoration = priorRestoration;
      window.clearTimeout(watchdog.current);
      gsap.killTweensOf(curtain.current);
      window.__zfyNavigating = false;
    };
  }, [navigate, release, settle]);

  return <NavigationContext.Provider value={{ navigate, commit }}>
    {children}
    <div className={styles.curtainHost} aria-hidden="true"><div ref={curtain} className={styles.curtain} /></div>
    <Suspense fallback={null}><RouteObserver /></Suspense>
  </NavigationContext.Provider>;
}
