import { ArrowRight, CheckCircle2, Clock3, BookOpen, Star } from 'lucide-react';
import { courses, courseMinutes, courseProgress } from '../domain';
import { useLearning } from '../store';
import Modal from './Modal';
import { CourseArt } from './Artwork';
export default function CourseDetail({
  courseId,
  onClose,
  onLearn,
}: {
  courseId: string;
  onClose: () => void;
  onLearn: (id: string) => void;
}) {
  const c = courses.find((c) => c.id === courseId)!;
  const { state, enroll } = useLearning();
  const joined = state.enrolled.includes(c.id);
  return (
    <Modal title="课程详情" onClose={onClose} className="course-detail">
      <div className={`detail-cover ${c.color}`}>
        <CourseArt kind={c.art} />
        <span className="badge">
          {c.category} · {c.level}
        </span>
      </div>
      <span className="eyebrow">A NEW CHAPTER AWAITS</span>
      <h2>{c.title}</h2>
      <p className="detail-subtitle">{c.subtitle}</p>
      <div className="detail-meta">
        <span>
          <BookOpen size={14} />
          {c.lessons.length} 个章节
        </span>
        <span>
          <Clock3 size={14} />
          {courseMinutes(c)} 分钟
        </span>
        <span>
          <Star size={14} />
          {c.rating} 分
        </span>
      </div>
      <h3>你将收获</h3>
      <div className="skill-list">
        {c.skills.map((s) => (
          <span key={s}>
            <CheckCircle2 size={13} />
            {s}
          </span>
        ))}
      </div>
      <div className="detail-instructor">
        <span className={`teacher-avatar ${c.color}`}>{c.instructor.slice(-2)}</span>
        <div>
          <strong>{c.instructor}</strong>
          <p>{c.role} · 带你把知识转化为实践</p>
        </div>
      </div>
      <h3>课程目录</h3>
      <ol className="lesson-preview">
        {c.lessons.map((l, i) => (
          <li key={l.id}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <strong>{l.title}</strong>
            <small>{l.minutes} 分钟</small>
            {state.completed.includes(l.id) && <CheckCircle2 size={14} />}
          </li>
        ))}
      </ol>
      {joined && (
        <p className="detail-progress">
          已完成 {courseProgress(c, state.completed)}% · 学习进度自动保存
        </p>
      )}
      <button
        className="button primary wide"
        onClick={() => {
          enroll(c.id);
          onClose();
          onLearn(c.id);
        }}
      >
        {joined ? '继续学习' : '加入学习，开启成长'}
        <ArrowRight size={14} />
      </button>
    </Modal>
  );
}
