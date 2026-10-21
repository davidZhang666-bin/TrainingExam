import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, Send, Save, Timer } from 'lucide-react';
import { type Attempt, type Exam } from '../domain';
import { useLearning } from '../store';
import { buildAttempt } from '../assessment';
import Modal from './Modal';
export default function ExamRunner({
  exam,
  onFinish,
}: {
  exam: Exam;
  onFinish: (a: Attempt) => void;
}) {
  const { state, saveDraft, addAttempt, storageError } = useLearning();
  const draft = state.draft!;
  const [confirm, setConfirm] = useState(false);
  const question = exam.questions[draft.index];
  const answered = exam.questions.filter((q) => draft.answers[q.id] !== undefined).length;
  const jump = (index: number) => saveDraft({ ...draft, index });
  const [now, setNow] = useState(Date.now);
  const submitted = useRef(false);
  const remaining = Math.max(0, Math.ceil((draft.deadline - now) / 1000));
  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    const attempt = buildAttempt(exam, draft.answers, draft.deadline);
    addAttempt(attempt);
    onFinish(attempt);
  }, [exam, draft, addAttempt, onFinish]);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 500);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useEffect(() => {
    if (now >= draft.deadline) submit();
  }, [now, draft.deadline, submit]);
  return (
    <div className="exam-workspace">
      <div className="exam-session-header">
        <div>
          <span className="eyebrow">TAKE YOUR NEXT STEP</span>
          <h1>{exam.title}</h1>
          <p>认真思考，比快速作答更重要。</p>
        </div>
        <div
          className={'exam-timer ' + (remaining < 60 ? 'urgent' : '')}
          role="timer"
          aria-label={'剩余时间' + remaining + '秒'}
        >
          <Timer size={19} />
          <div>
            <small>剩余时间</small>
            <strong>
              {String(Math.floor(remaining / 60)).padStart(2, '0')}
              <span>:</span>
              {String(remaining % 60).padStart(2, '0')}
            </strong>
          </div>
        </div>
      </div>
      <div className="exam-layout">
        <article className="panel question-panel">
          <div className="question-meta">
            <span className="badge">单选题</span>
            <span>每题 {100 / exam.questions.length} 分</span>
            <strong>
              {draft.index + 1}
              <small> / {exam.questions.length}</small>
            </strong>
          </div>
          <h2>{question.text}</h2>
          <div className="question-options" role="radiogroup" aria-label={question.text}>
            {question.options.map((option, i) => (
              <label
                className={`answer-option ${draft.answers[question.id] === i ? 'selected' : ''}`}
                key={option}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={draft.answers[question.id] === i}
                  disabled={remaining === 0}
                  onChange={() => {
                    if (Date.now() >= draft.deadline) submit();
                    else saveDraft({ ...draft, answers: { ...draft.answers, [question.id]: i } });
                  }}
                />
                <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
                {draft.answers[question.id] === i && <Check size={16} />}
              </label>
            ))}
          </div>
          <div className="question-footer">
            <button
              className="button"
              disabled={draft.index === 0}
              onClick={() => jump(draft.index - 1)}
            >
              <ArrowLeft size={13} />
              上一题
            </button>
            <span>
              <Save size={12} />
              {storageError ? '本次答案尚未存入浏览器' : '答案已自动保存'}
            </span>
            <button
              className="button primary"
              disabled={draft.index === exam.questions.length - 1}
              onClick={() => jump(draft.index + 1)}
            >
              下一题
              <ArrowRight size={13} />
            </button>
          </div>
        </article>
        <aside className="panel answer-sheet">
          <h3>答题卡</h3>
          <p>
            已作答 <strong>{answered}</strong> / {exam.questions.length} 题
          </p>
          <div className="answer-numbers">
            {exam.questions.map((q, i) => (
              <button
                key={q.id}
                aria-label={`第${i + 1}题${draft.answers[q.id] !== undefined ? '，已作答' : ''}`}
                aria-current={draft.index === i ? 'step' : undefined}
                className={`${draft.index === i ? 'current' : ''} ${draft.answers[q.id] !== undefined ? 'answered' : ''}`}
                onClick={() => jump(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="answer-sheet-legend">
            <span>
              <i />
              未作答
            </span>
            <span>
              <i />
              已作答
            </span>
          </div>
          <div className="callout">可以自由切换题目。离开页面后，考试仍会持续计时。</div>
          <button className="button primary wide" onClick={() => setConfirm(true)}>
            <Send size={13} />
            提交试卷
          </button>
        </aside>
      </div>
      {confirm && (
        <Modal title="确认交卷" onClose={() => setConfirm(false)} className="exam-rules">
          <span className="eyebrow">READY TO SUBMIT?</span>
          <h2>
            {answered === exam.questions.length
              ? '准备交卷了吗？'
              : '还有 ' + (exam.questions.length - answered) + ' 道题未作答'}
          </h2>
          <p>
            已完成 {answered} / {exam.questions.length} 题。未作答的题目将计为 0
            分，交卷后可查看解析。
          </p>
          <div className="dialog-actions">
            <button className="button" onClick={() => setConfirm(false)}>
              继续检查
            </button>
            <button className="button primary" onClick={submit}>
              确认交卷
              <Send size={13} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
