import { useState } from 'react';
import { courses } from '../../domain';
import { useLearning } from '../../store';
import Modal from '../../components/Modal';
import EmptyState from '../../workspace/ui/EmptyState';

export default function LessonNoteImport({ onClose }: { onClose: () => void }) {
  const { state, addNotebookNote } = useLearning();
  const candidates = courses.flatMap((course) =>
    course.lessons.flatMap((lesson) => {
      const body = state.notes[lesson.id]?.trim();
      const title = `${course.title} · ${lesson.title}`;
      if (
        !body ||
        state.notebook.some(
          (note) => note.courseId === course.id && note.title === title && note.body === body,
        )
      )
        return [];
      return [{ id: lesson.id, title, body, courseId: course.id }];
    }),
  );
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Modal title="收集章节笔记" onClose={onClose} className="ws-dialog">
      <span className="eyebrow">COLLECT YOUR INSIGHTS</span>
      <h2>把章节笔记汇入笔记本</h2>
      <p>选择要收集的记录，原章节笔记继续保留。相同标题和内容的记录不会重复收集。</p>
      {!candidates.length ? (
        <EmptyState title="暂时没有可收集的新笔记">
          先在课程章节里记录一点收获，再回到这里整理。
        </EmptyState>
      ) : (
        <fieldset className="ws-rubric">
          <legend>可收集 {candidates.length} 条</legend>
          {candidates.map((note) => (
            <label key={note.id}>
              <input
                type="checkbox"
                checked={selected.includes(note.id)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, note.id]
                      : current.filter((id) => id !== note.id),
                  )
                }
              />
              <span>
                <strong>{note.title}</strong>
                <small>{note.body.slice(0, 80)}</small>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="dialog-actions">
        <button className="button" onClick={onClose}>
          取消
        </button>
        <button
          className="button primary"
          disabled={!selected.length}
          onClick={() => {
            for (const note of candidates.filter((item) => selected.includes(item.id)))
              addNotebookNote({
                title: note.title,
                body: note.body,
                courseId: note.courseId,
                tags: ['章节摘录'],
              });
            onClose();
          }}
        >
          收集 {selected.length} 条笔记
        </button>
      </div>
    </Modal>
  );
}
