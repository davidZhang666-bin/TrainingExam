import { useState, type FormEvent } from 'react';
import { courses } from '../../domain';
import Modal from '../../components/Modal';
import TagInput from '../../workspace/ui/TagInput';
import StatusBanner from '../../workspace/ui/StatusBanner';
import type { NotebookNote, NoteInput } from './types';

export default function NoteEditor({
  note,
  onSave,
  onClose,
}: {
  note?: NotebookNote;
  onSave: (input: NoteInput) => string[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<NoteInput>(() =>
    note
      ? { title: note.title, body: note.body, courseId: note.courseId, tags: [...note.tags] }
      : { title: '', body: '', courseId: '', tags: [] },
  );
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const errors = onSave(form);
    if (errors.length) setError(errors.join(' '));
    else onClose();
  };
  return (
    <Modal
      title={note ? '编辑学习笔记' : '新建学习笔记'}
      onClose={onClose}
      className="ws-note-editor"
    >
      <span className="eyebrow">THOUGHTS WORTH KEEPING</span>
      <h2>{note ? '整理这条笔记' : '记下刚刚想到的事'}</h2>
      <form className="ws-form" onSubmit={submit}>
        <label className="form-field">
          笔记标题
          <input
            data-autofocus
            required
            maxLength={100}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="一句话概括这条记录"
          />
        </label>
        <label className="form-field">
          关联课程
          <select
            value={form.courseId}
            onChange={(event) => setForm({ ...form, courseId: event.target.value })}
          >
            <option value="">自由笔记</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          笔记正文
          <textarea
            required
            rows={11}
            maxLength={12000}
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            placeholder="写下启发、问题或之后要做的事"
          />
        </label>
        <small className="ws-char-count">{form.body.length} / 12000</small>
        <TagInput
          value={form.tags}
          onChange={(tags) => setForm((current) => ({ ...current, tags }))}
        />
        <StatusBanner message={error} tone="error" />
        <div className="dialog-actions">
          <button type="button" className="button" onClick={onClose}>
            取消
          </button>
          <button className="button primary" type="submit">
            保存笔记
          </button>
        </div>
      </form>
    </Modal>
  );
}
