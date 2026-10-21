"use client";

import { lifeNotes } from "@/lib/life-notes";
import ScrollPreview, { type PreviewItem } from "./ScrollPreview";

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
  return <ScrollPreview items={previews} kind="note" label="生活笔记" />;
}
