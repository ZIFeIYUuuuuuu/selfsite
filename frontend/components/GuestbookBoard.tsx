"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./GuestbookBoard.module.css";

type Category = "hello" | "question" | "idea" | "合作" | "友站";
type SortOrder = "latest" | "oldest";
type GuestbookItem = { id: string; name: string; category: Category; message: string; createdAt: string };
type GuestbookResponse = { items: GuestbookItem[]; page: number; pageSize: number; total: number; hasNext: boolean; remainingToday: number };
type Feedback = { tone: "success" | "error"; text: string } | null;

const categories: Array<{ value: Category; label: string }> = [
  { value: "hello", label: "招呼" },
  { value: "question", label: "问题" },
  { value: "idea", label: "想法" },
  { value: "合作", label: "合作" },
  { value: "友站", label: "友站" }
];
const emptyData: GuestbookResponse = { items: [], page: 1, pageSize: 8, total: 0, hasNext: false, remainingToday: 2 };
const seenKey = "selfsite:guestbook:intro-seen:v2";
const fingerprintKey = "selfsite:guestbook:fingerprint:v1";

function categoryLabel(category: Category) { return categories.find((item) => item.value === category)?.label ?? category; }
function dateLabel(value: string) { return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(value)); }
function getFingerprint() {
  try {
    const existing = window.localStorage.getItem(fingerprintKey);
    if (existing) return existing;
    const value = crypto.randomUUID();
    window.localStorage.setItem(fingerprintKey, value);
    return value;
  } catch { return "session-" + Math.random().toString(36).slice(2); }
}

export default function GuestbookBoard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<Category>("hello");
  const [honeypot, setHoneypot] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sort, setSort] = useState<SortOrder>("latest");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(seenKey)) {
        window.localStorage.setItem(seenKey, "1");
        setDialogOpen(true);
      }
    } catch { setDialogOpen(true); }
  }, []);

  useEffect(() => {
    if (!dialogOpen) {
      previousFocusRef.current?.focus();
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const all = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("input, textarea, select, button:not([disabled])"));
      if (!all.length) return;
      const first = all[0]; const last = all[all.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen]);

  const loadMessages = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const params = new URLSearchParams({ category: filterCategory, page: String(page), sort });
    if (query) params.set("q", query);
    try {
      const response = await fetch(`/api/v1/guestbook?${params}`, { cache: "no-store", credentials: "include", signal });
      const body = (await response.json()) as GuestbookResponse & { error?: string };
      if (!response.ok) throw new Error(body.error || "留言暂时无法读取。");
      setData(body);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "留言暂时无法读取。" });
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [filterCategory, page, query, sort]);

  useEffect(() => { const controller = new AbortController(); void loadMessages(controller.signal); return () => controller.abort(); }, [loadMessages]);

  function openDialog() { setFeedback(null); setDialogOpen(true); }
  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); setQuery(queryInput.trim().slice(0, 80)); }
  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || data.remainingToday === 0) return;
    setSubmitting(true); setFeedback(null);
    try {
      const response = await fetch("/api/v1/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ category, message, name, website: honeypot, fingerprint: getFingerprint() }) });
      const body = (await response.json()) as { error?: string; remainingToday?: number; message?: string };
      if (!response.ok) throw new Error(body.error || "留言暂时无法提交。");
      setData((current) => ({ ...current, remainingToday: body.remainingToday ?? current.remainingToday }));
      setMessage(""); setHoneypot("");
      setFeedback({ tone: "success", text: body.message || "留言已进入审核，审核通过后会显示在公开墙。" });
    } catch (error) { setFeedback({ tone: "error", text: error instanceof Error ? error.message : "留言暂时无法提交。" }); }
    finally { setSubmitting(false); }
  }

  return <main className={styles.shell}>
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>Guestbook / 01</p><h1>留一句，<em>再相遇。</em></h1><p className={styles.lede}>问题、建议，或者只是打个招呼。留言会先进入私密审核箱，审核通过后才会出现在这里。</p></div>
      <button className={styles.openButton} onClick={openDialog} ref={triggerRef} type="button"><span className={styles.buttonDot} />写一条留言<span aria-hidden="true">↗</span></button>
    </section>
    <section className={styles.wall} aria-labelledby="wall-title">
      <div className={styles.wallHeader}><div><p className={styles.eyebrow}>The wall</p><h2 id="wall-title">公开留言 <span>{data.total}</span></h2></div><div className={styles.quota}>{data.remainingToday}/2 <span>今日可提交</span></div></div>
      <div className={styles.controls}><div className={styles.filters} aria-label="留言类型筛选"><button className={filterCategory === "all" ? styles.activeFilter : ""} onClick={() => { setFilterCategory("all"); setPage(1); }} type="button">全部</button>{categories.map((item) => <button className={filterCategory === item.value ? styles.activeFilter : ""} key={item.value} onClick={() => { setFilterCategory(item.value); setPage(1); }} type="button">{item.label}</button>)}<select aria-label="留言排序" className={styles.sort} onChange={(event) => { setSort(event.target.value as SortOrder); setPage(1); }} value={sort}><option value="latest">最新</option><option value="oldest">最早</option></select></div><form className={styles.search} onSubmit={submitSearch}><input aria-label="搜索公开留言" onChange={(event) => setQueryInput(event.target.value)} placeholder="搜索" value={queryInput} /><button type="submit" aria-label="提交搜索">⌕</button></form></div>
      {loading ? <p className={styles.state}>正在读取公开留言…</p> : data.items.length === 0 ? <div className={styles.empty}><span className={styles.emptyMark}>○</span><strong>这里还没有公开留言</strong><span>成为第一个留下话的人。</span></div> : <div className={styles.messageList}>{data.items.map((item) => <article className={styles.message} key={item.id}><div className={styles.messageMeta}><span className={styles.avatar}>{item.name.slice(0, 1)}</span><strong>{item.name}</strong><span className={styles.tag}>{categoryLabel(item.category)}</span><time dateTime={item.createdAt}>{dateLabel(item.createdAt)}</time></div><p>{item.message}</p></article>)}</div>}
      {data.total > data.pageSize ? <div className={styles.pagination}><button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">←</button><span>{page}</span><button disabled={!data.hasNext} onClick={() => setPage((value) => value + 1)} type="button">→</button></div> : null}
    </section>
    {dialogOpen ? <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}><div aria-describedby="guestbook-dialog-note" aria-labelledby="guestbook-dialog-title" aria-modal="true" className={styles.dialog} ref={dialogRef} role="dialog"><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>Leave a note</p><h2 id="guestbook-dialog-title">写下你的留言</h2></div><button aria-label="关闭留言弹窗" className={styles.close} onClick={() => setDialogOpen(false)} type="button">×</button></div><p className={styles.dialogNote} id="guestbook-dialog-note">提交后会进入私密审核箱，只有审核通过才会公开。设备标识仅用于防止重复注册，不会展示。</p><form className={styles.form} onSubmit={submitMessage}><div className={styles.formRow}><label>怎么称呼你<input autoComplete="nickname" maxLength={30} onChange={(event) => setName(event.target.value)} placeholder="昵称" required value={name} /></label><label>类型<select onChange={(event) => setCategory(event.target.value as Category)} value={category}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div><label>想说什么<textarea maxLength={600} onChange={(event) => setMessage(event.target.value)} placeholder="写点具体的内容…" required rows={5} value={message} /><small>{message.length}/600</small></label><label aria-hidden="true" className={styles.trap}>Website<input autoComplete="off" onChange={(event) => setHoneypot(event.target.value)} tabIndex={-1} value={honeypot} /></label><div className={styles.formFooter}><span>每天最多 2 条 · 不接受外链和代码</span><button disabled={submitting || data.remainingToday === 0} type="submit">{submitting ? "送审中…" : data.remainingToday === 0 ? "明天再来" : "送审核"}<span aria-hidden="true">↗</span></button></div></form>{feedback ? <p aria-live="polite" className={`${styles.feedback} ${styles[feedback.tone]}`}>{feedback.text}</p> : null}</div></div> : null}
  </main>;
}
