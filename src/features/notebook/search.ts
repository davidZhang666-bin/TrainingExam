import type { NotebookNote, NoteFilter } from './types';

export function filterNotes(notes: NotebookNote[], filter: NoteFilter): NotebookNote[] {
  const words = filter.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return notes
    .filter((note) => {
      const searchable = [note.title, note.body, ...note.tags].join(' ').toLocaleLowerCase();
      return (
        note.archived === filter.archived &&
        (!filter.tag || note.tags.includes(filter.tag)) &&
        (!filter.courseId || note.courseId === filter.courseId) &&
        words.every((word) => searchable.includes(word))
      );
    })
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        (filter.sort === 'title'
          ? a.title.localeCompare(b.title, 'zh-CN')
          : filter.sort === 'oldest'
            ? a.updatedAt.localeCompare(b.updatedAt)
            : b.updatedAt.localeCompare(a.updatedAt)),
    );
}

export function noteTags(notes: NotebookNote[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const note of notes.filter((item) => !item.archived))
    for (const tag of note.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export function excerpt(body: string, query = '', max = 150): string {
  const flat = body.replace(/\s+/g, ' ');
  const firstWord = query.toLocaleLowerCase().trim().split(/\s+/)[0];
  const match = firstWord ? flat.toLocaleLowerCase().indexOf(firstWord) : -1;
  const start = match > 30 ? match - 30 : 0;
  return `${start ? '…' : ''}${flat.slice(start, start + max)}${flat.length > start + max ? '…' : ''}`;
}
