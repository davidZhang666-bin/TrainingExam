import { Check, Trash2 } from 'lucide-react';
import { courses } from '../../domain';
import { displayDate } from '../../workspace/dates';
import { taskKindNames, type StudyTask } from './types';

export default function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  onLearn,
}: {
  task: StudyTask;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLearn: (id: string) => void;
}) {
  return (
    <article className={`ws-task-row ${task.status === 'done' ? 'completed' : ''}`}>
      <button
        className="ws-check"
        aria-label={task.status === 'done' ? `重新打开${task.title}` : `完成${task.title}`}
        aria-pressed={task.status === 'done'}
        onClick={onToggle}
      >
        {task.status === 'done' && <Check size={14} />}
      </button>
      <div className="ws-task-copy">
        <div>
          <strong>{task.title}</strong>
          <span className={`ws-task-kind ${task.kind}`}>{taskKindNames[task.kind]}</span>
        </div>
        <p>
          {displayDate(task.date)} · {task.time} · {task.minutes} 分钟
          {task.courseId
            ? ` · ${courses.find((course) => course.id === task.courseId)?.title}`
            : ''}
        </p>
        {task.description && <small>{task.description}</small>}
      </div>
      <div className="ws-task-tools">
        <button className="text-button" onClick={onEdit}>
          修改
        </button>
        {task.courseId && (
          <button className="text-button" onClick={() => onLearn(task.courseId)}>
            去学习
          </button>
        )}
        <button className="icon-button" aria-label={`删除${task.title}`} onClick={onDelete}>
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
