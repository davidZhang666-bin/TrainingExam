import { ArrowRight, BookOpen, Clock3, ClipboardCheck, Award, CalendarDays, TrendingUp } from 'lucide-react';
import { useLearning } from '../store';
import { courses, courseProgress, exams, type Page } from '../domain';
import { HeroArt } from '../components/Artwork';
import ActivityChart from '../components/ActivityChart';
import StudyPlan from '../components/StudyPlan';
import ContinueLearning from '../components/ContinueLearning';
export default function Dashboard({ navigate, onLearn, onOpen }: { navigate: (p: Page) => void; onLearn: (id: string) => void; onOpen: (id: string) => void }) {
  const { state } = useLearning();
  const total = state.activity.reduce((s, a) => s + a.minutes, 0);
  const completed = courses.filter(c => courseProgress(c, state.completed) === 100).length;
  const passed = new Set(state.attempts.filter(a => a.score >= (exams.find(e => e.id === a.examId)?.pass ?? 100)).map(a => a.examId)).size;
  const remaining = courses.find(c => state.enrolled.includes(c.id) && courseProgress(c, state.completed) < 100);
  const metrics = [
    { title: '累计学习', value: (total / 60).toFixed(1), unit: '小时', icon: Clock3, note: '每一次投入，都算数', color: 'purple' },
    { title: '在学课程', value: state.enrolled.length, unit: '门', icon: BookOpen, note: `${completed} 门已完成学习`, color: 'peach' },
    { title: '通过考试', value: passed, unit: '场', icon: ClipboardCheck, note: `${state.attempts.length} 次测评记录`, color: 'mint' },
    { title: '获得证书', value: passed, unit: '张', icon: Award, note: '见证每一个成长时刻', color: 'blue' },
  ];
  return <div className="dashboard"><section className="page-intro"><div><span className="eyebrow">A LITTLE PROGRESS, EVERY DAY</span><h1>{state.profile.name}，今天也要向前一步 <span className="greeting-dot">✦</span></h1><p>欢迎回来，新的知识与可能正在等你发现。</p></div><span className="date-label"><CalendarDays size={14} />{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span></section>
    <section className="hero"><div className="hero-copy"><span className="hero-label"><span /> YOUR NEXT CHAPTER</span><h2>把学习，变成成长的日常。</h2><p>每一份好奇，都值得认真对待。<br/>从一门好课开始，积蓄面向未来的力量。</p><div className="hero-actions"><button className="button light" onClick={() => remaining ? onLearn(remaining.id) : navigate('catalog')}>继续我的学习 <ArrowRight size={14} /></button><span>每天进步一点点 ↗</span></div></div><HeroArt /><div className="hero-annotation">✧ STAY CURIOUS. KEEP GROWING.</div></section>
    <div className="metrics-grid">{metrics.map(m => <section className="panel metric-card" key={m.title}><div className="metric-top"><span>{m.title}</span><span className={`metric-icon ${m.color}`}><m.icon size={18} strokeWidth={1.6} /></span></div><div className="metric-value">{m.value}<small>{m.unit}</small></div><p>{m.title === '累计学习' && <TrendingUp size={11}/>} {m.note}</p></section>)}</div>
    <div className="dashboard-body"><div className="dashboard-main"><ContinueLearning navigate={navigate} onLearn={onLearn} onOpen={onOpen}/><ActivityChart /></div><div className="dashboard-aside"><StudyPlan navigate={navigate} onLearn={onLearn}/></div></div></div>;
}
