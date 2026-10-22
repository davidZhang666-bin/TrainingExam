import { ArrowUpRight, Route, Users } from 'lucide-react';
import type { LearningPath } from './types';
import type { LearningState } from '../../domain';
import { pathProgress } from './progress';
import ProgressBar from '../../workspace/ui/ProgressBar';

export default function PathCard({
  path,
  state,
  onSelect,
}: {
  path: LearningPath;
  state: LearningState;
  onSelect: () => void;
}) {
  const progress = pathProgress(path, state);
  const joined = !!state.pathEnrollments[path.id];
  return (
    <article className={`panel ws-path-card ${path.color}`}>
      <div className="ws-path-cover">
        <Route size={32} />
        <span>
          {path.steps.length} 个阶段 · 约 {progress.minutes} 分钟
        </span>
      </div>
      <div className="ws-path-copy">
        <span className="eyebrow">
          {joined
            ? progress.complete
              ? 'JOURNEY COMPLETED'
              : 'YOUR JOURNEY'
            : 'A NEW LEARNING JOURNEY'}
        </span>
        <h2>{path.title}</h2>
        <p>{path.summary}</p>
        <small>
          <Users size={14} />
          {path.audience}
        </small>
        <ProgressBar
          value={progress.percent}
          label={`${progress.finished} / ${progress.total} 阶段已完成`}
        />
        <button className="button primary ws-full-button" onClick={onSelect}>
          {joined ? '查看我的路径' : '了解学习路径'}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
