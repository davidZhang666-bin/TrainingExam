import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import type { pathProgress } from './progress';
import ProgressBar from '../../workspace/ui/ProgressBar';

type Step = ReturnType<typeof pathProgress>['steps'][number];
export default function PathStep({
  step,
  joined,
  onLearn,
  onExam,
}: {
  step: Step;
  joined: boolean;
  onLearn: (id: string) => void;
  onExam: () => void;
}) {
  const locked = !joined || !step.available;
  return (
    <li className={`ws-path-step ${locked ? 'locked' : ''}`}>
      <span className={`ws-step-number ${step.complete ? 'done' : ''}`}>
        {step.complete ? <Check size={18} /> : locked ? <LockKeyhole size={16} /> : step.index + 1}
      </span>
      <div className="ws-step-content">
        <h3>{step.course.title}</h3>
        <p>{step.objective}</p>
        <ProgressBar value={step.progress} label="课程章节" />
        {step.requireExam && (
          <small>
            关联测评：{step.passed ? '已通过' : '待通过'} · 完成全部章节及测评后解锁下一阶段
          </small>
        )}
        {!locked && (
          <div className="ws-step-actions">
            <button className="button" onClick={() => onLearn(step.courseId)}>
              {step.progress === 100 ? '回顾课程' : '继续学习'}
              <ArrowRight size={14} />
            </button>
            {step.requireExam && step.progress === 100 && !step.passed && (
              <button className="button primary" onClick={onExam}>
                去测评
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
