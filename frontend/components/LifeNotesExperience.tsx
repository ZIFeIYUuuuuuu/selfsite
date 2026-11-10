"use client";

import { lifeNotes } from "@/lib/life-notes";
import ScrollPreview, { type PreviewItem } from "./ScrollPreview";
import styles from "./ReferenceHome.module.css";

const previews: readonly PreviewItem[] = lifeNotes.map(note => ({
  title: note.title,
  label: note.shortTitle,
  summary: note.summary,
  tag: note.date?.replaceAll("-", ".") ?? note.format,
  href: `/notes?note=${note.slug}`,
  date: note.date,
  paragraphs: note.paragraphs,
}));

export default function LifeNotesExperience() {
  if (!previews.length) return <p className={styles.lifeNotesPlaceholder}>目前站长还没想好</p>;
  return <ScrollPreview items={previews} kind="note" label="生活笔记" />;
}
