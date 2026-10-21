import { ArrowLeft, ArrowRight, Award, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { exams, type Attempt } from '../domain';
export default function ExamResult({
  attempt,
  onBack,
  onCertificates,
}: {
  attempt: Attempt;
  onBack: () => void;
  onCertificates: () => void;
}) {
  const exam = exams.find((e) => e.id === attempt.examId)!;
  const passed = attempt.score >= exam.pass;
  const correct = exam.questions.filter((q) => attempt.answers[q.id] === q.answer).length;
  return (
    <>
      <button className="text-button back-link" onClick={onBack}>
        <ArrowLeft size={14} />
        返回考试中心
      </button>
      <section className="panel result-summary">
        <div className={`score-ring ${passed ? 'passed' : ''}`}>
          <strong>
            {attempt.score}
            <small>分</small>
          </strong>
          <span>{passed ? '测评通过' : '继续加油'}</span>
        </div>
        <div className="result-copy">
          <span className="eyebrow">EVERY ATTEMPT IS PROGRESS</span>
          <h1>{passed ? '努力有了回响，恭喜通过！' : '每次尝试，都让理解更进一步'}</h1>
          <p>
            {exam.title} · 及格线 {exam.pass} 分
          </p>
          <div className="result-facts">
            <span>
              <CheckCircle2 size={14} />
              答对 {correct} 题
            </span>
            <span>
              <XCircle size={14} />
              答错或未答 {exam.questions.length - correct} 题
            </span>
            <span>{new Date(attempt.submittedAt).toLocaleString('zh-CN')}</span>
          </div>
          <div className="result-actions">
            {passed && (
              <button className="button primary" onClick={onCertificates}>
                <Award size={14} />
                领取我的证书
                <ArrowRight size={13} />
              </button>
            )}
            <button className="button" onClick={onBack}>
              <RotateCcw size={13} />
              返回，重新挑战
            </button>
          </div>
        </div>
      </section>
      <div className="panel-heading review-heading">
        <h2>把每一道题，真正学会</h2>
        <span className="section-kicker">ANSWER REVIEW</span>
      </div>
      <div className="stack">
        {exam.questions.map((q, i) => {
          const selected = attempt.answers[q.id];
          const right = selected === q.answer;
          return (
            <article className="panel review-question" key={q.id}>
              <div className="review-question-title">
                <span className={`badge ${right ? 'green' : 'peach'}`}>
                  {right ? '回答正确' : selected === undefined ? '未作答' : '回答错误'}
                </span>
                <span>第 {i + 1} 题</span>
              </div>
              <h3>{q.text}</h3>
              <div className="review-options">
                {q.options.map((o, j) => (
                  <div
                    key={o}
                    className={`${j === q.answer ? 'correct' : ''} ${j === selected && !right ? 'incorrect' : ''}`}
                  >
                    <span>{String.fromCharCode(65 + j)}</span>
                    <p>{o}</p>
                    {j === q.answer && (
                      <small>
                        正确答案 <CheckCircle2 size={12} />
                      </small>
                    )}
                    {j === selected && j !== q.answer && (
                      <small>
                        你的答案 <XCircle size={12} />
                      </small>
                    )}
                  </div>
                ))}
              </div>
              <div className="answer-explanation">
                <strong>知识解析</strong>
                <p>{q.explanation}</p>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
