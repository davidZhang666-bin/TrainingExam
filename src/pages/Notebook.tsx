import { useMemo, useState } from 'react';
import { Download, FilePlus2, Library } from 'lucide-react';
import { downloadFile } from '../downloads';
import { useLearning } from '../store';
import { filterNotes, noteTags } from '../features/notebook/search';
import { noteMarkdown, notebookMarkdown, safeFilename } from '../features/notebook/export';
import type { NotebookNote, NoteFilter } from '../features/notebook/types';
import NoteEditor from '../features/notebook/NoteEditor';
import NoteCard from '../features/notebook/NoteCard';
import NoteFilters from '../features/notebook/NoteFilters';
import LessonNoteImport from '../features/notebook/LessonNoteImport';
import PageIntro from '../components/PageIntro';
import EmptyState from '../workspace/ui/EmptyState';
import ConfirmDialog from '../workspace/ui/ConfirmDialog';

export default function Notebook() {
  const {
    state,
    addNotebookNote,
    updateNotebookNote,
    deleteNotebookNote,
    toggleNotebookPin,
    toggleNotebookArchive,
  } = useLearning();
  const [filter, setFilter] = useState<NoteFilter>({
    query: '',
    tag: '',
    courseId: '',
    archived: false,
    sort: 'recent',
  });
  const [editing, setEditing] = useState<NotebookNote | 'new' | null>(null);
  const [removing, setRemoving] = useState<NotebookNote | null>(null);
  const [collecting, setCollecting] = useState(false);
  const notes = useMemo(() => filterNotes(state.notebook, filter), [state.notebook, filter]);
  const filtered = !!(filter.query || filter.tag || filter.courseId);
  return (
    <>
      <PageIntro
        title="把灵感和收获，留在自己的笔记里"
        subtitle="课程笔记以外，也可以随手记录问题、想法和下一步。"
        eyebrow="A NOTEBOOK FOR YOUR IDEAS"
      >
        <button className="button primary" onClick={() => setEditing('new')}>
          <FilePlus2 size={15} />
          新建笔记
        </button>
        <button className="button" onClick={() => setCollecting(true)}>
          <Library size={15} />
          收集章节笔记
        </button>
        <button
          className="button"
          disabled={!notes.length}
          onClick={() =>
            downloadFile(
              '知序学习-笔记合集.md',
              notebookMarkdown(notes),
              'text/markdown;charset=utf-8',
            )
          }
        >
          <Download size={14} />
          导出当前结果
        </button>
      </PageIntro>
      <NoteFilters
        filter={filter}
        onChange={setFilter}
        tags={noteTags(
          state.notebook
            .filter((note) => note.archived === filter.archived)
            .map((note) => ({ ...note, archived: false })),
        )}
      />
      <div className="ws-note-results">
        <span>{filter.archived ? '归档' : '学习'}笔记</span>
        <small>{notes.length} 条记录</small>
      </div>
      {!notes.length ? (
        <div className="panel">
          <EmptyState
            title={
              filtered
                ? '没有找到匹配的笔记'
                : filter.archived
                  ? '这里还没有归档笔记'
                  : '从一条笔记开始'
            }
          >
            {filtered
              ? '试试清空部分筛选条件，或者换一个关键词。'
              : '记录一次新的发现，之后可以按标签和课程继续整理。'}
          </EmptyState>
        </div>
      ) : (
        <div className="ws-note-grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              query={filter.query}
              onEdit={() => setEditing(note)}
              onTag={(tag) => setFilter({ ...filter, tag })}
              onPin={() => toggleNotebookPin(note.id)}
              onArchive={() => toggleNotebookArchive(note.id)}
              onDelete={() => setRemoving(note)}
              onExport={() =>
                downloadFile(
                  `${safeFilename(note.title)}.md`,
                  noteMarkdown(note),
                  'text/markdown;charset=utf-8',
                )
              }
            />
          ))}
        </div>
      )}
      {editing && (
        <NoteEditor
          note={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(input) =>
            (editing === 'new' ? addNotebookNote(input) : updateNotebookNote(editing.id, input))
              .errors
          }
        />
      )}
      {collecting && <LessonNoteImport onClose={() => setCollecting(false)} />}
      {removing && (
        <ConfirmDialog
          title="删除这条笔记？"
          description={`「${removing.title}」将从当前笔记本中移除。需要保留时可以先导出 Markdown。`}
          confirm="删除笔记"
          onClose={() => setRemoving(null)}
          onConfirm={() => deleteNotebookNote(removing.id)}
        />
      )}
    </>
  );
}
