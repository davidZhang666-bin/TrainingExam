import { useMemo, useState } from 'react';
import { ArrowLeft, BrainCircuit, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { courses } from '../domain';
import PageIntro from '../components/PageIntro';
import { useLearning } from '../store';
import { practiceBank, questionById } from '../features/practice/bank';
import { availableQuestions, shuffled } from '../features/practice/session';
import { gradePractice } from '../features/practice/grading';
import { dateKey } from '../workspace/dates';
import { practiceMetrics } from '../features/practice/metrics';
import { kindNames, type PracticeRecord, type QuestionKind } from '../features/practice/types';
import MetricCards from '../workspace/ui/MetricCards';
import ProgressBar from '../workspace/ui/ProgressBar';
import StatusBanner from '../workspace/ui/StatusBanner';
import EmptyState from '../workspace/ui/EmptyState';
import QuestionOptions from '../features/practice/QuestionOptions';
import QuestionNavigation from '../features/practice/QuestionNavigation';
import PracticeReview from '../features/practice/PracticeReview';

export default function Practice() {
  const {
    state,
    beginPractice,
    answerPractice,
    movePractice,
    finishPracticeSession,
    clearPracticeSession,
  } = useLearning();
  const [courseId, setCourseId] = useState('');
  const [kind, setKind] = useState<'all' | QuestionKind>('all');
  const [count, setCount] = useState(10);
  const [onlyUnseen, setOnlyUnseen] = useState(false);
  const [result, setResult] = useState<PracticeRecord | null>(null);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const metrics = useMemo(() => practiceMetrics(state.practiceHistory), [state.practiceHistory]);
  const candidates = useMemo(
    () => availableQuestions({ courseId, kind, count, onlyUnseen }, state.practiceHistory),
    [courseId, kind, count, onlyUnseen, state.practiceHistory],
  );
  const due = state.reviewSchedule.filter((item) => item.due <= dateKey());
  const mistakes = state.reviewSchedule.filter((item) => !item.lastCorrect);
  const session = state.practiceSession;
  const question = session ? questionById.get(session.questionIds[session.index]) : null;
  const answered = session
    ? session.questionIds.filter((id) => (session.answers[id]?.length ?? 0) > 0).length
    : 0;
  const start = (ids: string[], mode: 'practice' | 'review' = 'practice') => {
    if (session) {
      setError('请先继续或放弃当前练习，再开始另一组。');
      setResult(null);
      setPaused(true);
      return;
    }
    if (!ids.length) {
      setError('目前没有符合条件的题目。');
      return;
    }
    setError('');
    setResult(null);
    setPaused(false);
    beginPractice(ids, mode);
  };
  const finish = () => {
    const record = finishPracticeSession();
    if (record) setResult(record);
  };
  if (session && question && !paused)
    return (
      <>
        <button className="text-button back-link" onClick={() => setPaused(true)}>
          <ArrowLeft size={14} /> 暂停练习
        </button>
        <PageIntro
          title={session.mode === 'review' ? '间隔复习' : '专项练习'}
          subtitle="认真想一想，完成这组练习后可以查看答案解析。"
          eyebrow="PRACTICE MAKES KNOWLEDGE LAST"
        >
          <span className="ws-practice-progress">
            第 {session.index + 1} / {session.questionIds.length} 题
          </span>
        </PageIntro>
        <section className="panel ws-practice-card">
          <ProgressBar
            value={(answered / session.questionIds.length) * 100}
            label={`已作答 ${answered} / ${session.questionIds.length}`}
          />
          <div className="ws-question-top">
            <span>{kindNames[question.kind]}</span>
            <span>{question.difficulty}</span>
            <span>{question.skill}</span>
          </div>
          <h2>{question.prompt}</h2>
          <p className="ws-question-tip">
            {question.kind === 'multiple' ? '请选择所有正确选项' : '请选择一个答案'}
          </p>
          <QuestionOptions
            question={question}
            answer={session.answers[question.id] ?? []}
            onChange={(answer) => answerPractice(question.id, answer)}
          />
          <QuestionNavigation session={session} onMove={movePractice} onFinish={finish} />
        </section>
      </>
    );
  if (result)
    return (
      <PracticeReview
        record={result}
        onBack={() => setResult(null)}
        onRetry={() => start(result.questionIds, result.mode)}
      />
    );
  const history = state.practiceHistory;
  return (
    <>
      <PageIntro
        title="练一点，记得更久"
        subtitle="按课程和题型练习，也可以回到该复习的知识点。"
        eyebrow="LEARN BY DOING"
      />
      <MetricCards
        items={[
          {
            label: '练习次数',
            value: metrics.sessions,
            detail: `${metrics.answers} 道练习题（含漏答）`,
          },
          {
            label: '整体正确率',
            value: metrics.accuracy === null ? '—' : `${metrics.accuracy}%`,
            detail: `${metrics.correct} 道题答对`,
          },
          { label: '待复习题目', value: due.length, detail: '按间隔复习安排' },
          { label: '需要巩固', value: mistakes.length, detail: '最近一次作答有误' },
        ]}
      />
      <StatusBanner message={error} tone="error" />
      <div className="ws-practice-layout">
        <section className="panel ws-practice-config">
          <span className="ws-icon-tile">
            <BrainCircuit size={21} />
          </span>
          <h2>开始一组练习</h2>
          <p>从 {practiceBank.length} 道练习题中选出适合当前目标的题目。</p>
          {session && (
            <div className="ws-resume">
              <strong>还有一组未完成的练习</strong>
              <p>
                已作答 {answered} / {session.questionIds.length} 题
              </p>
              <button className="button primary" onClick={() => setPaused(false)}>
                继续上次练习
              </button>
              <button className="button" onClick={clearPracticeSession}>
                放弃草稿
              </button>
            </div>
          )}
          <label className="form-field">
            课程
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
              <option value="">全部课程</option>
              {courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            题型
            <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
              <option value="all">全部题型</option>
              {Object.entries(kindNames).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            题目数量
            <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {[5, 10, 15, 20].map((value) => (
                <option key={value} value={value}>
                  {value} 题
                </option>
              ))}
            </select>
          </label>
          <label className="ws-check-field">
            <input
              type="checkbox"
              checked={onlyUnseen}
              onChange={(event) => setOnlyUnseen(event.target.checked)}
            />
            只练习尚未做过的题
          </label>
          <small className="ws-candidate-count">当前匹配 {candidates.length} 题</small>
          <button
            className="button primary ws-full-button"
            disabled={!candidates.length || !!session}
            onClick={() =>
              start(
                shuffled(candidates)
                  .slice(0, Math.min(count, candidates.length))
                  .map((question) => question.id),
              )
            }
          >
            <Sparkles size={15} />
            开始练习
          </button>
        </section>
        <div className="stack">
          <section className="panel ws-review-queue">
            <div className="panel-heading">
              <h2>
                <RotateCcw size={18} /> 间隔复习
              </h2>
              <span className="badge">{due.length} 题待复习</span>
            </div>
            <p>答对后逐步延长复习间隔；答错或漏答的题目会更早再次出现。</p>
            {due.length ? (
              <button
                className="button primary"
                onClick={() =>
                  start(
                    due.map((item) => item.questionId),
                    'review',
                  )
                }
              >
                开始复习今日题目
              </button>
            ) : (
              <small>目前没有到期题目，可以先开始专项练习。</small>
            )}
          </section>
          {metrics.skills.length > 0 && (
            <section className="panel ws-skill-metrics">
              <div className="panel-heading">
                <h2>知识点掌握情况</h2>
                <span className="section-kicker">KNOWLEDGE CHECK</span>
              </div>
              {metrics.skills.slice(0, 5).map((item) => (
                <ProgressBar
                  key={item.skill}
                  value={item.accuracy ?? 0}
                  label={`${item.skill} · ${item.answered} 题`}
                />
              ))}
            </section>
          )}
          <section className="panel ws-history-panel">
            <div className="panel-heading">
              <h2>最近练习</h2>
              <span className="badge">
                覆盖 {metrics.coverage} / {practiceBank.length} 题
              </span>
            </div>
            {!history.length ? (
              <EmptyState title="你的练习记录会出现在这里">
                答题结束后可以随时回看选项、标准答案和解析。
              </EmptyState>
            ) : (
              history
                .slice()
                .reverse()
                .slice(0, 5)
                .map((record) => {
                  const grade = gradePractice(record);
                  return (
                    <button
                      key={record.id}
                      className="ws-history-row"
                      onClick={() => setResult(record)}
                    >
                      <span className="ws-history-icon">
                        <CheckCircle2 size={17} />
                      </span>
                      <span>
                        <strong>{record.mode === 'review' ? '间隔复习' : '专项练习'}</strong>
                        <small>
                          {new Date(record.finishedAt).toLocaleString('zh-CN')} · {grade.correct}/
                          {grade.total} 题
                        </small>
                      </span>
                      <b>{grade.score} 分</b>
                    </button>
                  );
                })
            )}
          </section>
        </div>
      </div>
      {mistakes.length > 0 && (
        <section className="panel ws-mistake-strip">
          <div>
            <h3>错题需要一点额外关注</h3>
            <p>
              {mistakes
                .map((item) => questionById.get(item.questionId)?.skill)
                .filter(Boolean)
                .slice(0, 3)
                .join(' · ')}
            </p>
          </div>
          <button
            className="button"
            onClick={() =>
              start(
                mistakes.map((item) => item.questionId),
                'review',
              )
            }
          >
            复习错题
          </button>
        </section>
      )}
    </>
  );
}
