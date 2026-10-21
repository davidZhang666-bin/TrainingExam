import { useState } from 'react';
import { Clock3, BookOpen, Target, Flame, ArrowUpRight } from 'lucide-react';
import { courses, courseProgress, exams } from '../domain';
import { useLearning, localDate } from '../store';
import PageIntro from '../components/PageIntro';
import ActivityChart, { activityDays } from '../components/ActivityChart';
export default function Analytics({ onLearn }: { onLearn: (id: string) => void }) {
  const { state } = useLearning();
  const [period, setPeriod] = useState(7);
  const from = new Date();
  from.setDate(from.getDate() - period + 1);
  const since = localDate(from);
  const activity = state.activity.filter((a) => a.date >= since && a.date <= localDate());
  const minutes = activity.reduce((s, a) => s + a.minutes, 0);
  const attempts = state.attempts.filter((a) => localDate(new Date(a.submittedAt)) >= since);
  const average = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : null;
  const studied = new Set(activity.filter((a) => a.minutes > 0).map((a) => a.date)).size;
  let streak = 0;
  const days = activityDays(state.activity, 366).reverse();
  for (const day of days) {
    if (!day.minutes) break;
    streak++;
  }
  const stats = [
    {
      label: '学习投入',
      value: (minutes / 60).toFixed(1),
      unit: '小时',
      icon: Clock3,
      color: 'purple',
    },
    { label: '学习天数', value: studied, unit: '天', icon: BookOpen, color: 'peach' },
    {
      label: '测评平均分',
      value: average ?? '—',
      unit: average === null ? '暂无测评' : '分',
      icon: Target,
      color: 'mint',
    },
    { label: '当前连续学习', value: streak, unit: '天', icon: Flame, color: 'blue' },
  ];
  const categories = ['通用能力', '数字技能', '合规必修'].map((name, i) => ({
    name,
    color: ['purple', 'peach', 'blue'][i],
    minutes: activity
      .filter((a) => courses.find((c) => c.id === a.courseId)?.category === name)
      .reduce((s, a) => s + a.minutes, 0),
  }));
  return (
    <>
      <PageIntro
        title="看见积累，看见成长"
        subtitle="每一步都算数，用真实的学习记录，发现自己的进步。"
        eyebrow="YOUR GROWTH IN PERSPECTIVE"
      >
        <label className="period-select">
          <select
            aria-label="学习报告时间范围"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value="7">近 7 天</option>
            <option value="30">近 30 天</option>
            <option value="365">近一年</option>
          </select>
        </label>
      </PageIntro>
      <div className="metrics-grid">
        {stats.map((s) => (
          <section className="panel metric-card" key={s.label}>
            <div className="metric-top">
              <span>{s.label}</span>
              <span className={`metric-icon ${s.color}`}>
                <s.icon size={17} />
              </span>
            </div>
            <div className="metric-value">
              {s.value}
              <small>{s.unit}</small>
            </div>
            <p>{s.label === '当前连续学习' ? '截至今天的连续天数' : '所选时间范围内的学习记录'}</p>
          </section>
        ))}
      </div>
      <div className="analytics-grid">
        <div className="stack">
          <ActivityChart />
          <section className="panel analytics-panel">
            <div className="panel-heading">
              <h2>课程成长进度</h2>
              <span className="section-kicker">COURSE PROGRESS</span>
            </div>
            {courses
              .filter((c) => state.enrolled.includes(c.id))
              .map((c) => (
                <button key={c.id} className="report-course" onClick={() => onLearn(c.id)}>
                  <div>
                    <strong>{c.title}</strong>
                    <span>
                      {courseProgress(c, state.completed)}%<ArrowUpRight size={12} />
                    </span>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: courseProgress(c, state.completed) + '%' }} />
                  </div>
                  <small>
                    已完成 {c.lessons.filter((l) => state.completed.includes(l.id)).length} /{' '}
                    {c.lessons.length} 章
                  </small>
                </button>
              ))}
          </section>
        </div>
        <div className="stack">
          <section className="panel analytics-panel">
            <div className="panel-heading">
              <h2>时间花在哪里</h2>
            </div>
            <p className="report-note">所选范围 · {minutes} 分钟学习投入</p>
            {categories.map((c) => (
              <div className="category-row" key={c.name}>
                <div>
                  <span>{c.name}</span>
                  <strong>{c.minutes} 分钟</strong>
                </div>
                <div className="progress-track">
                  <span
                    className={c.color}
                    style={{ width: (minutes ? (c.minutes / minutes) * 100 : 0) + '%' }}
                  />
                </div>
              </div>
            ))}
          </section>
          <section className="panel analytics-panel">
            <div className="panel-heading">
              <h2>测评能力记录</h2>
            </div>
            <p className="report-note">历史最佳成绩，记录知识掌握情况</p>
            {exams.map((e) => {
              const scores = state.attempts.filter((a) => a.examId === e.id).map((a) => a.score);
              return (
                <div className="skill-score" key={e.id}>
                  <span>{e.category}</span>
                  <strong>
                    {scores.length ? Math.max(...scores) : '—'}
                    <small>{scores.length ? '分' : '未测评'}</small>
                  </strong>
                </div>
              );
            })}
            <div className="callout">
              学习报告包含演示初始记录。继续完成章节，查看属于你的新增成长足迹。
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
