"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { notes } from "@/lib/site-content";

function NotesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug = searchParams.get("note");

  const activeNote = useMemo(() => {
    return notes.find((item) => item.slug === activeSlug) ?? notes[0];
  }, [activeSlug]);

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
          <div className="note-reader-meta">
            <p className="work-tag">{activeNote.format}</p>
            <p className="project-year">最新</p>
          </div>

          <div className="note-reader-body">
            <h2>{activeNote.title}</h2>
            <p className="project-summary">{activeNote.lead}</p>

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
          </div>
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
