import { Archive, BookOpen, Download, Pin, PinOff, Trash2 } from 'lucide-react';
import { courses } from '../../domain';
import { excerpt } from './search';
import type { NotebookNote } from './types';

export default function NoteCard({
  note,
  query,
  onEdit,
  onTag,
  onPin,
  onExport,
  onArchive,
  onDelete,
}: {
  note: NotebookNote;
  query: string;
  onEdit: () => void;
  onTag: (tag: string) => void;
  onPin: () => void;
  onExport: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="panel ws-note-card">
      <div className="ws-note-card-top">
        <span>
          <BookOpen size={14} />
          {courses.find((course) => course.id === note.courseId)?.title ?? '自由笔记'}
        </span>
        {note.pinned && (
          <span className="ws-pinned">
            <Pin size={12} fill="currentColor" />
            置顶
          </span>
        )}
      </div>
      <button className="ws-note-title" onClick={onEdit}>
        <h3>{note.title}</h3>
      </button>
      <p className="ws-note-excerpt">{excerpt(note.body, query)}</p>
      <div className="ws-note-tags">
        {note.tags.map((tag) => (
          <button key={tag} onClick={() => onTag(tag)}>
            #{tag}
          </button>
        ))}
      </div>
      <footer>
        <time dateTime={note.updatedAt}>
          {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
        </time>
        <div>
          <button
            title={note.pinned ? '取消置顶' : '置顶笔记'}
            aria-label={`${note.pinned ? '取消置顶' : '置顶'}${note.title}`}
            onClick={onPin}
          >
            {note.pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button title="导出 Markdown" aria-label={`导出${note.title}`} onClick={onExport}>
            <Download size={15} />
          </button>
          <button
            title={note.archived ? '取消归档' : '归档'}
            aria-label={`${note.archived ? '取消归档' : '归档'}${note.title}`}
            onClick={onArchive}
          >
            <Archive size={15} />
          </button>
          <button title="删除笔记" aria-label={`删除${note.title}`} onClick={onDelete}>
            <Trash2 size={15} />
          </button>
        </div>
      </footer>
    </article>
  );
}
