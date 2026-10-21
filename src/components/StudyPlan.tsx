import { ArrowRight, Check, ClipboardCheck, Target, BookOpen } from 'lucide-react';
import { useLearning, localDate } from '../store';
import { calendarWeek } from '../dates';
import { courses, exams, courseProgress, type Page } from '../domain';
export default function StudyPlan({
  navigate,
  onLearn,
}: {
  navigate: (p: Page) => void;
  onLearn: (id: string) => void;
}) {
  const { state } = useLearning();
  const days = calendarWeek();
  const week = state.activity
    .filter((a) => a.date >= days[0].date && a.date <= localDate())
    .reduce((s, a) => s + a.minutes, 0);
  const percent = Math.min(100, Math.round((week / state.profile.goal) * 100));
  const next = courses.find(
    (c) => state.enrolled.includes(c.id) && courseProgress(c, state.completed) < 100,
  );
  const exam = exams.find(
    (e) => !state.attempts.some((a) => a.examId === e.id && a.score >= e.pass),
  );
  return (
    <>
      <section className="panel goal-panel">
        <div className="panel-heading">
          <h2>本周小目标</h2>
          <Target size={18} className="muted" />
        </div>
        <div className="goal-visual">
          <svg viewBox="0 0 120 120" aria-label={`目标完成${percent}%`}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f0ecf5" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#aa8ace"
              strokeWidth="8"
              strokeDasharray={`${percent * 3.1416} 314.16`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div>
            <strong>
              {percent}
              <small>%</small>
            </strong>
            <span>目标达成</span>
          </div>
        </div>
        <p className="goal-caption">
          已学习 <strong>{week}</strong> / {state.profile.goal} 分钟
        </p>
        <div className="goal-days">
          {days.map((d) => (
            <span
              key={d.date}
              className={
                state.activity.some((a) => a.date === d.date && a.minutes > 0) ? 'done' : ''
              }
              title={d.label + ' · ' + d.date}
            >
              {state.activity.some((a) => a.date === d.date && a.minutes > 0) ? (
                <Check size={10} />
              ) : (
                '·'
              )}
            </span>
          ))}
        </div>
        <p className="goal-encouragement">
          {percent === 100 ? '本周目标已达成，继续保持热爱 ✨' : '不必一步到位，只需每天向前。'}
        </p>
        <button className="text-button" onClick={() => navigate('settings')}>
          调整学习目标 <ArrowRight size={12} />
        </button>
      </section>
      <section className="panel agenda-panel">
        <div className="panel-heading">
          <h2>接下来，做这些</h2>
          <span className="agenda-dot" />
        </div>
        {next && (
          <button className="agenda-item" onClick={() => onLearn(next.id)}>
            <span className="agenda-icon purple">
              <BookOpen size={15} />
            </span>
            <div>
              <strong>继续一段好奇</strong>
              <p>{next.title}</p>
              <small>
                下一章 · {next.lessons.find((l) => !state.completed.includes(l.id))?.title}
              </small>
            </div>
            <ArrowRight size={13} />
          </button>
        )}
        {exam && (
          <button className="agenda-item" onClick={() => navigate('exams')}>
            <span className="agenda-icon peach">
              <ClipboardCheck size={15} />
            </span>
            <div>
              <strong>检验你的学习成果</strong>
              <p>{exam.title}</p>
              <small>
                {exam.minutes} 分钟 · {exam.questions.length} 道题
              </small>
            </div>
            <ArrowRight size={13} />
          </button>
        )}
        {!next && !exam && (
          <div className="callout">所有学习任务已完成，去课程中心探索更多吧。</div>
        )}
        <div className="agenda-tip">小提醒：完成课程后测评，理解会更深刻。</div>
      </section>
    </>
  );
}
