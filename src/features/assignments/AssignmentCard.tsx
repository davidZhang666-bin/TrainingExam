import { ArrowRight, ClipboardPen, Clock3 } from 'lucide-react';
import { courses } from '../../domain';
import type { Assignment } from './types';

export default function AssignmentCard({
  assignment,
  status,
  onOpen,
}: {
  assignment: Assignment;
  status: 'submitted' | 'draft' | 'new';
  onOpen: () => void;
}) {
  return (
    <article className="panel ws-assignment-card">
      <div className="ws-assignment-card-head">
        <span className="ws-icon-tile">
          <ClipboardPen size={22} />
        </span>
        <span className={`badge ${status === 'submitted' ? 'green' : ''}`}>
          {status === 'submitted' ? '已提交自评' : status === 'draft' ? '草稿中' : '未开始'}
        </span>
      </div>
      <small>{courses.find((course) => course.id === assignment.courseId)?.title}</small>
      <h2>{assignment.title}</h2>
      <p>{assignment.brief}</p>
      <footer>
        <span>
          <Clock3 size={14} />约 {assignment.minutes} 分钟
        </span>
        <button className="text-button" onClick={onOpen}>
          {status === 'submitted' ? '回看作业' : status === 'draft' ? '继续完成' : '开始实践'}
          <ArrowRight size={14} />
        </button>
      </footer>
    </article>
  );
}
