"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./GuestbookReview.module.css";

type ReviewItem = { id: string; nickname: string; category: string; body: string; created_at: string; status: string; linkUrls: string[]; linkFlags: string[]; linkReviewRequired: boolean };

export default function GuestbookReview() {
  const [token, setToken] = useState("");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    if (!token.trim()) return;
    setLoading(true); setFeedback("");
    try {
      const response = await fetch(`/api/v1/guestbook/review?status=${status}`, { headers: { "X-Guestbook-Admin": token.trim() }, cache: "no-store" });
      const body = (await response.json()) as { items?: ReviewItem[]; error?: string };
      if (!response.ok) throw new Error(body.error || "无法读取审核箱。");
      setItems(body.items || []);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "无法读取审核箱。"); }
    finally { setLoading(false); }
  }, [status, token]);

  useEffect(() => { if (token) void load(); }, [load, token]);

  async function review(id: string, nextStatus: "approved" | "rejected") {
    const response = await fetch(`/api/v1/guestbook/review/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Guestbook-Admin": token.trim() }, body: JSON.stringify({ status: nextStatus }) });
    if (!response.ok) { setFeedback("审核操作失败，请检查权限或稍后重试。"); return; }
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>Private moderation</p><h1>留言审核</h1><p>只有你能看到这页。链接会单独标出，确认友站或正常资源后再放行。</p></div><a href="/guestbook">回到留言板 ↗</a></header>
    <section className={styles.toolbar}><label>管理员令牌<input autoComplete="off" onChange={(event) => setToken(event.target.value)} placeholder="粘贴服务器中的审核令牌" type="password" value={token} /></label><label>查看状态<select onChange={(event) => setStatus(event.target.value)} value={status}><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">已拒绝</option></select></label><button disabled={!token.trim() || loading} onClick={() => void load()} type="button">{loading ? "读取中…" : "刷新"}</button></section>
    {feedback ? <p className={styles.feedback}>{feedback}</p> : null}
    <section className={styles.list} aria-live="polite">{items.length === 0 ? <div className={styles.empty}>{token ? "当前没有待审核留言。" : "输入审核令牌后查看私密审核箱。"}</div> : items.map((item) => <article className={styles.item} key={item.id}><div className={styles.meta}><strong>{item.nickname}</strong><span>{item.category}</span><time>{new Date(item.created_at).toLocaleString("zh-CN")}</time></div><p>{item.body}</p>{item.linkUrls.length ? <div className={styles.links}><b>链接</b>{item.linkUrls.map((url) => <code key={url}>{url}</code>)}<small>{item.linkFlags.includes("spamhaus_dbl") ? "命中 Spamhaus DBL，建议谨慎" : "含链接，需要人工确认"}</small></div> : null}<div className={styles.actions}><button className={styles.reject} onClick={() => void review(item.id, "rejected")} type="button">拒绝</button><button onClick={() => void review(item.id, "approved")} type="button">通过并公开</button></div></article>)}</section>
  </main>;
}
