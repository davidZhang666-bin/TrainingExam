import { courses } from '../../domain';
import type { NotebookNote } from './types';

export function safeFilename(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
      .replace(/[. ]+$/, '')
      .slice(0, 80) || '学习笔记'
  );
}

export function noteMarkdown(note: NotebookNote): string {
  const course = courses.find((item) => item.id === note.courseId);
  return [
    `# ${note.title.replace(/[\r\n]/g, ' ')}`,
    '',
    `更新时间：${note.updatedAt.slice(0, 10)}`,
    course ? `关联课程：${course.title}` : '',
    note.tags.length ? `标签：${note.tags.join('、')}` : '',
    '',
    note.body,
    '',
  ]
    .filter((line, index, all) => line !== '' || index === 1 || all[index - 1] !== '')
    .join('\n');
}

export function notebookMarkdown(notes: NotebookNote[]): string {
  return notes.map(noteMarkdown).join('\n\n---\n\n');
}
