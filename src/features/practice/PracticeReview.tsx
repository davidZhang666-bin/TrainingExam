import { ArrowLeft, CircleHelp, RotateCcw } from 'lucide-react';
import PageIntro from '../../components/PageIntro';
import { gradePractice } from './grading';
import type { PracticeRecord } from './types';

export default function PracticeReview({
  record,
  onBack,
  onRetry,
}: {
  record: PracticeRecord;
  onBack: () => void;
  onRetry: () => void;
}) {
  const score = gradePractice(record);
  return (
    <>
      <button className="text-button back-link" onClick={onBack}>
        <ArrowLeft size={14} />
        返回练习中心
      </button>
      <PageIntro
        title={score.score >= 80 ? '理解正在变得更牢固' : '发现薄弱处，是进步的开始'}
        subtitle={`本次答对 ${score.correct} / ${score.total} 题 · ${score.unanswered} 题未作答`}
        eyebrow="YOUR PRACTICE RESULT"
      />
      <section className="panel ws-result-hero">
        <div className={`ws-result-score ${score.score >= 80 ? 'passed' : ''}`}>
          {score.score}
          <small>分</small>
        </div>
        <div>
          <span className="eyebrow">
            {record.mode === 'review' ? 'SPACED REVIEW' : 'FOCUSED PRACTICE'}
          </span>
          <h2>{score.score >= 80 ? '继续保持这个节奏' : '把解析里的要点带回下一轮'}</h2>
          <p>
            {new Date(record.finishedAt).toLocaleString('zh-CN')} · {score.correct} 道答对
          </p>
        </div>
        <button className="button primary" onClick={onRetry}>
          <RotateCcw size={14} />
          再做一次
        </button>
      </section>
      <div className="ws-review-list">
        {score.rows.map((row, index) => (
          <article key={row.question.id} className="panel ws-review-card">
            <div className="ws-review-head">
              <strong>
                {String(index + 1).padStart(2, '0')} · {row.question.prompt}
              </strong>
              <span className={row.correct ? 'correct' : 'incorrect'}>
                {row.correct ? '答对' : row.unanswered ? '未作答' : '待复习'}
              </span>
            </div>
            <div className="ws-review-answer">
              <span>你的答案</span>
              <p>
                {row.answer.length
                  ? row.answer.map((item) => row.question.options[item]).join('、')
                  : '未选择'}
              </p>
            </div>
            <div className="ws-review-answer right">
              <span>参考答案</span>
              <p>{row.question.correct.map((item) => row.question.options[item]).join('、')}</p>
            </div>
            <div className="ws-explanation">
              <CircleHelp size={16} />
              <p>{row.question.explanation}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
