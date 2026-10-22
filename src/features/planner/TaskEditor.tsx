import { useState, type FormEvent } from 'react';
import { Clock3 } from 'lucide-react';
import { courses } from '../../domain';
import Modal from '../../components/Modal';
import StatusBanner from '../../workspace/ui/StatusBanner';
import { conflictsFor } from './selectors';
import { taskKindNames, type StudyTask, type TaskInput, type TaskKind } from './types';

export default function TaskEditor({
  initial,
  editingId,
  tasks,
  onSave,
  onClose,
}: {
  initial: TaskInput;
  editingId?: string;
  tasks: StudyTask[];
  onSave: (input: TaskInput) => string[];
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const conflicts = conflictsFor(form, tasks, editingId);
    if (conflicts.length) {
      setError(`与「${conflicts[0].title}」时间重叠，请调整日期或时长。`);
      return;
    }
    const errors = onSave(form);
    if (errors.length) setError(errors.join(' '));
    else onClose();
  };
  return (
    <Modal
      title={editingId ? '修改学习计划' : '新建学习计划'}
      onClose={onClose}
      className="ws-dialog"
    >
      <span className="eyebrow">SMALL STEPS, STEADY GROWTH</span>
      <h2>{editingId ? '调整一下安排' : '安排一段专注时间'}</h2>
      <form className="ws-form" onSubmit={submit}>
        <label className="form-field">
          计划名称
          <input
            data-autofocus
            required
            maxLength={80}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="例如：复习数据分析第三章"
          />
        </label>
        <div className="ws-form-grid">
          <label className="form-field">
            日期
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
          </label>
          <label className="form-field">
            开始时间
            <input
              required
              type="time"
              value={form.time}
              onChange={(event) => setForm({ ...form, time: event.target.value })}
            />
          </label>
          <label className="form-field">
            计划时长
            <span className="ws-duration">
              <input
                required
                type="number"
                min={5}
                max={240}
                step={5}
                value={form.minutes}
                onChange={(event) => setForm({ ...form, minutes: Number(event.target.value) })}
              />
              <span>分钟</span>
            </span>
          </label>
          <label className="form-field">
            计划类型
            <select
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value as TaskKind })}
            >
              {Object.entries(taskKindNames).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="form-field">
          关联课程
          <select
            value={form.courseId}
            onChange={(event) => setForm({ ...form, courseId: event.target.value })}
          >
            <option value="">暂不关联</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          备注
          <textarea
            maxLength={1000}
            rows={3}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="为这次学习写一个小目标"
          />
        </label>
        <StatusBanner message={error} tone="error" />
        <div className="dialog-actions">
          <button type="button" className="button" onClick={onClose}>
            取消
          </button>
          <button className="button primary" type="submit">
            <Clock3 size={14} /> 保存计划
          </button>
        </div>
      </form>
    </Modal>
  );
}
