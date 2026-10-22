import { describe, expect, it } from 'vitest';
import { filterNotes, excerpt, noteTags } from './search';
import { parseNote } from './validation';
import { noteMarkdown, safeFilename } from './export';
import type { NotebookNote, NoteFilter } from './types';

const first: NotebookNote = {
  id: 'first',
  title: '研究问题',
  body: '访谈里要区分事实和推断',
  courseId: 'design',
  tags: ['访谈', '研究'],
  pinned: false,
  archived: false,
  createdAt: '2026-10-21T00:00:00.000Z',
  updatedAt: '2026-10-21T00:00:00.000Z',
};
const filter: NoteFilter = { query: '', tag: '', courseId: '', archived: false, sort: 'recent' };
describe('notebook retrieval', () => {
  it('combines all search words, course and tag filters and respects archival boundaries', () => {
    const notes = [
      first,
      { ...first, id: 'second', archived: true },
      { ...first, id: 'third', courseId: 'data' },
    ];
    expect(
      filterNotes(notes, { ...filter, query: '访谈 推断', tag: '研究', courseId: 'design' }).map(
        (note) => note.id,
      ),
    ).toEqual(['first']);
    expect(filterNotes(notes, { ...filter, query: '不存在' })).toEqual([]);
    expect(filterNotes(notes, { ...filter, archived: true }).map((note) => note.id)).toEqual([
      'second',
    ]);
  });
  it('keeps pins first and counts tags without archived records', () => {
    const notes = [
      first,
      { ...first, id: 'pinned', pinned: true },
      { ...first, id: 'archived', archived: true },
    ];
    expect(filterNotes(notes, filter)[0].id).toBe('pinned');
    expect(noteTags(notes).find((item) => item.tag === '访谈')?.count).toBe(2);
  });
  it('validates imported content and exports plain Markdown with safe file names', () => {
    expect(parseNote({ ...first, tags: ['访谈', '访谈', {}, ''] })?.tags).toEqual(['访谈']);
    expect(parseNote({ ...first, body: ' ' })).toBeNull();
    expect(parseNote({ ...first, createdAt: 'broken' })).toBeNull();
    expect(safeFilename('../研究:计划?.')).not.toMatch(/[/:?]/);
    expect(noteMarkdown(first)).toContain(first.body);
    expect(excerpt('前言'.repeat(50) + '关键词' + '尾注'.repeat(100), '关键词', 50)).toContain(
      '关键词',
    );
  });
});
