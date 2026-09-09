"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

import { notes } from "@/lib/site-content";

function NotesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug = searchParams.get("note");

  const activeNote = useMemo(() => {
    return notes.find((item) => item.slug === activeSlug) ?? notes[0];
  }, [activeSlug]);
  const activeIndex = Math.max(0, notes.findIndex((item) => item.slug === activeNote.slug));
  const previousNote = notes[activeIndex - 1];
  const nextNote = notes[activeIndex + 1];
  const readingMinutes = Math.max(
    1,
    Math.ceil(
      [activeNote.lead, ...activeNote.sections.flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])]), ...(activeNote.closing ?? [])]
        .join("")
        .length / 420
    )
  );
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(scrollableHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100)) : 0);
    };

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);

    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, [activeNote.slug]);

  const handleSelectNote = (slug: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("note", slug);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Notes</p>
        <h1>笔记</h1>
      </section>

      <section className="page-block note-hub">
        <aside className="note-sidebar">
          <div className="note-sidebar-head">
            <p className="section-label">Latest Notes</p>
            <h2>目录</h2>
          </div>

          <div className="note-nav-list">
            {notes.map((item, index) => {
              const isActive = item.slug === activeNote.slug;

              return (
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={`note-nav-button ${isActive ? "is-active" : ""}`}
                  key={item.slug}
                  onClick={() => handleSelectNote(item.slug)}
                  type="button"
                >
                  <span className="note-nav-order">{String(index + 1).padStart(2, "0")}</span>
                  <span className="note-nav-copy">
                    <span className="note-nav-format">{item.format}</span>
                    <span className="note-nav-title">{item.shortTitle}</span>
                    <span className="note-nav-summary">{item.summary}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="note-reader">
          <div aria-hidden="true" className="note-reading-progress">
            <span style={{ width: `${readingProgress}%` }} />
          </div>
          <div className="note-reader-meta">
            <p className="work-tag">{activeNote.format}</p>
            <p className="project-year">{String(activeIndex + 1).padStart(2, "0")} / {String(notes.length).padStart(2, "0")}</p>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="note-reader-body"
            initial={{ opacity: 0.72, y: 8 }}
            key={activeNote.slug}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <h2>{activeNote.title}</h2>
            <p className="project-summary">{activeNote.lead}</p>
            <div className="note-reader-actions" aria-label="文章信息与导航">
              <span>{readingMinutes} 分钟阅读</span>
              <span aria-hidden="true">·</span>
              <a href="/work">查看相关作品</a>
            </div>

            {activeNote.sections.map((section) => (
              <section className="article-section" key={section.title}>
                <h3>{section.title}</h3>

                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {section.quote ? <blockquote className="article-quote">{section.quote}</blockquote> : null}

                {section.bullets?.length ? (
                  <ul className="capsule-list article-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {activeNote.checklist?.length ? (
              <section className="article-section">
                <h3>清单</h3>
                <ul className="capsule-list article-list">
                  {activeNote.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {activeNote.closing?.length ? (
              <section className="article-section">
                <h3>结尾</h3>
                {activeNote.closing.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ) : null}

            <nav className="note-pagination" aria-label="文章导航">
              {previousNote ? (
                <button type="button" onClick={() => handleSelectNote(previousNote.slug)}>
                  <span>上一篇</span>
                  <strong>{previousNote.shortTitle}</strong>
                </button>
              ) : <span />}
              {nextNote ? (
                <button type="button" onClick={() => handleSelectNote(nextNote.slug)}>
                  <span>下一篇</span>
                  <strong>{nextNote.shortTitle}</strong>
                </button>
              ) : <span />}
            </nav>
          </motion.div>
        </article>
      </section>
    </>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={null}>
      <NotesContent />
    </Suspense>
  );
}
