import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { PracticeSession } from './types';

export default function QuestionNavigation({
  session,
  onMove,
  onFinish,
}: {
  session: PracticeSession;
  onMove: (index: number) => void;
  onFinish: () => void;
}) {
  return (
    <div className="ws-question-nav">
      <button
        className="button"
        disabled={session.index === 0}
        onClick={() => onMove(session.index - 1)}
      >
        <ArrowLeft size={14} />
        上一题
      </button>
      <div className="ws-question-dots">
        {session.questionIds.map((id, index) => (
          <button
            key={id}
            aria-label={`第${index + 1}题`}
            aria-current={index === session.index ? 'step' : undefined}
            className={`${index === session.index ? 'active' : ''} ${session.answers[id]?.length ? 'answered' : ''}`}
            onClick={() => onMove(index)}
          />
        ))}
      </div>
      {session.index < session.questionIds.length - 1 ? (
        <button className="button primary" onClick={() => onMove(session.index + 1)}>
          下一题
          <ArrowRight size={14} />
        </button>
      ) : (
        <button className="button primary" onClick={onFinish}>
          完成练习
          <CheckCircle2 size={14} />
        </button>
      )}
    </div>
  );
}
