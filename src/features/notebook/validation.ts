import { courses } from '../../domain';
import { record, text, tags, timestamp } from '../../workspace/validation';
import type { NotebookNote, NoteInput } from './types';

export function validateNote(input: NoteInput): string[] {
  const errors = [];
  if (!input.title.trim() || input.title.length > 100) errors.push('笔记标题需要 1–100 个字符。');
  if (!input.body.trim() || input.body.length > 12000) errors.push('正文需要 1–12000 个字符。');
  if (input.courseId && !courses.some((course) => course.id === input.courseId))
    errors.push('关联课程不存在。');
  return errors;
}

export function parseNote(value: unknown): NotebookNote | null {
  const raw = record(value);
  const createdAt = timestamp(raw.createdAt);
  const updatedAt = timestamp(raw.updatedAt);
  if (!text(raw.id) || !createdAt || !updatedAt) return null;
  const input: NoteInput = {
    title: text(raw.title, 100),
    body: text(raw.body, 12000),
    courseId: courses.some((course) => course.id === raw.courseId) ? String(raw.courseId) : '',
    tags: tags(raw.tags),
  };
  if (validateNote(input).length) return null;
  return {
    ...input,
    id: text(raw.id),
    createdAt,
    updatedAt,
    pinned: raw.pinned === true,
    archived: raw.archived === true,
  };
}
