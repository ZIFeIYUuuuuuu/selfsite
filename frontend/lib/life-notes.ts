import type { NoteItem } from "./site-content";

export const lifeNotes: readonly NoteItem[] = [];

// Keep bookmarks to the unpublished article in the Life section.
export const lifeNoteSlugs = ["life-why-am-i-avoiding", ...lifeNotes.map(note => note.slug)];
