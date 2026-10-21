"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { notes } from "@/lib/site-content";
import { lifeNotes } from "@/lib/life-notes";
import { useSiteMode } from "@/components/ThemeProvider";
import { useSiteNavigation } from "@/components/NavigationProvider";
import ReferenceChrome from "@/components/ReferenceChrome";
import homeStyles from "@/components/ReferenceHome.module.css";
import styles from "./Notes.module.css";

function NotesContent() {
  const search = useSearchParams();
  const { mode, setMode } = useSiteMode();
  const { navigate } = useSiteNavigation();
  const activeSlug = search.get("note");
  const articleMode = lifeNotes.some(note => note.slug === activeSlug) ? "life" : notes.some(note => note.slug === activeSlug) ? "work" : mode;
  const collection = articleMode === "work" ? notes : lifeNotes;
  const activeNote = useMemo(() => collection.find(note => note.slug === activeSlug) ?? collection[0], [collection, activeSlug]);
  const activeIndex = collection.findIndex(note => note.slug === activeNote.slug);

  // A direct article link owns its theme; a mode toggle opens the other collection.
  useLayoutEffect(() => {
    if (lifeNotes.some(note => note.slug === activeSlug)) setMode("life");
    else if (notes.some(note => note.slug === activeSlug)) setMode("work");
  }, [activeSlug, setMode]);

  const select = (slug: string) => navigate(`/notes?note=${slug}`);
  return <div className={`${homeStyles.page} ${styles.page}`} data-mode={articleMode}>
    <ReferenceChrome />
    <div className={styles.content} data-note-page-content>
      <div className={styles.pageTopline}>
        <Link href="/#notes">← 返回首页笔记</Link>
        <span>{articleMode === "work" ? "WORK / NOTES" : "LIFE / NOTES"}</span>
      </div>
      <div className={`${styles.noteHub} ${collection.length === 1 ? styles.singleNote : ""}`}>
        <aside className={styles.sidebar} aria-label="笔记目录">
          <div className={styles.sidebarHead}><span>INDEX / {String(collection.length).padStart(2, "0")}</span><h2>笔记</h2></div>
          <nav className={styles.noteNav}>
            {collection.map((note, index) => <button
              type="button" key={note.slug} aria-current={note.slug === activeNote.slug ? "page" : undefined}
              className={`${styles.noteNavButton} ${note.slug === activeNote.slug ? styles.active : ""}`}
              onClick={() => { if (note.slug !== activeNote.slug) select(note.slug); }}>
              <span className={styles.noteOrder}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.noteNavCopy}><span className={styles.noteFormat}>{note.date?.replaceAll("-", ".") ?? note.format}</span><strong>{note.shortTitle}</strong></span>
              <span className={styles.noteArrow} aria-hidden="true">↗</span>
            </button>)}
          </nav>
        </aside>
        <article className={styles.reader} aria-labelledby="note-title">
            <div key={activeNote.slug} className={styles.readerBody}>
              <div className={styles.articleMeta}>
                <span>{activeNote.format}</span>
                {activeNote.date && <time dateTime={activeNote.date}>{activeNote.date.replaceAll("-", ".")}</time>}
              </div>
              <h1 id="note-title">{activeNote.title}</h1>
              {activeNote.lead && <p className={styles.lead}>{activeNote.lead}</p>}
              {activeNote.paragraphs?.map(paragraph => <p className={styles.personalParagraph} key={paragraph}>{paragraph}</p>)}
              {activeNote.sections.map(section => <section className={styles.articleSection} key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                {section.quote && <blockquote>{section.quote}</blockquote>}
                {!!section.bullets?.length && <ul>{section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}
              </section>)}
              {!!activeNote.checklist?.length && <section className={styles.articleSection}><h2>清单</h2><ul>{activeNote.checklist.map(item => <li key={item}>{item}</li>)}</ul></section>}
              {!!activeNote.closing?.length && <section className={styles.articleSection}><h2>结语</h2>{activeNote.closing.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>}
              <nav className={styles.pagination} aria-label="文章导航">
                {collection[activeIndex - 1] ? <button type="button" onClick={() => select(collection[activeIndex - 1].slug)}><span>← 上一篇</span><strong>{collection[activeIndex - 1].shortTitle}</strong></button> : <span />}
                {collection[activeIndex + 1] ? <button type="button" onClick={() => select(collection[activeIndex + 1].slug)}><span>下一篇 →</span><strong>{collection[activeIndex + 1].shortTitle}</strong></button> : <Link className={styles.returnLink} href="/#notes">返回首页笔记 ↗</Link>}
              </nav>
            </div>
        </article>
      </div>
      <footer className={styles.pageFooter}><Link href="/#notes">返回首页笔记 ↑</Link><span>子非鱼 · {articleMode === "work" ? "WORK" : "LIFE"} NOTES</span></footer>
    </div>
  </div>;
}

export default function NotesPage() {
  return <Suspense fallback={<div className={`${homeStyles.page} ${styles.loading}`}>加载笔记…</div>}><NotesContent /></Suspense>;
}
