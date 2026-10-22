import { useState } from 'react';
import { ArrowLeft, Route, CheckCircle2 } from 'lucide-react';
import { useLearning } from '../store';
import { learningPaths } from '../features/paths/catalog';
import { pathProgress } from '../features/paths/progress';
import PathCard from '../features/paths/PathCard';
import PathStep from '../features/paths/PathStep';
import PageIntro from '../components/PageIntro';
import MetricCards from '../workspace/ui/MetricCards';
import ConfirmDialog from '../workspace/ui/ConfirmDialog';

export default function LearningPaths({
  onLearn,
  onExam,
}: {
  onLearn: (id: string) => void;
  onExam: () => void;
}) {
  const { state, enrollPath, unenrollPath, enroll } = useLearning();
  const [selectedId, setSelectedId] = useState('');
  const [leaving, setLeaving] = useState(false);
  const selected = learningPaths.find((path) => path.id === selectedId);
  const joinedPaths = learningPaths.filter((path) => state.pathEnrollments[path.id]);
  if (selected) {
    const progress = pathProgress(selected, state);
    const joined = !!state.pathEnrollments[selected.id];
    return (
      <>
        <button className="text-button back-link" onClick={() => setSelectedId('')}>
          <ArrowLeft size={14} /> 返回学习路径
        </button>
        <PageIntro
          title={selected.title}
          subtitle={selected.summary}
          eyebrow="GROW WITH A CLEAR DIRECTION"
        />
        <section className="panel ws-path-detail">
          <span className="ws-icon-tile">
            <Route size={24} />
          </span>
          <div>
            <h2>这条路径能带来什么</h2>
            <p>{selected.outcome}</p>
            <small>适合：{selected.audience}</small>
          </div>
          {joined ? (
            <button className="button" onClick={() => setLeaving(true)}>
              退出路径
            </button>
          ) : (
            <button className="button primary" onClick={() => enrollPath(selected.id)}>
              加入学习路径
            </button>
          )}
        </section>
        {progress.complete && (
          <div className="ws-banner success" role="status">
            <CheckCircle2 size={19} />
            你已完成所有课程与所需测评，继续将所学运用到工作中。
          </div>
        )}
        <ol className="ws-path-steps">
          {progress.steps.map((step) => (
            <PathStep
              key={step.courseId}
              step={step}
              joined={joined}
              onLearn={(id) => {
                enroll(id);
                onLearn(id);
              }}
              onExam={onExam}
            />
          ))}
        </ol>
        {!joined && (
          <p className="ws-muted">加入后可按阶段学习；你已有的课程进度和成绩会自动计入。</p>
        )}
        {leaving && (
          <ConfirmDialog
            title="退出这条学习路径？"
            description="课程报名、学习进度和考试成绩仍会保留，以后可以重新加入。"
            confirm="退出路径"
            onClose={() => setLeaving(false)}
            onConfirm={() => unenrollPath(selected.id)}
          />
        )}
      </>
    );
  }
  return (
    <>
      <PageIntro
        title="顺着一条路径，走得更远"
        subtitle="把相关课程串成连续的成长目标，循序渐进地建立能力。"
        eyebrow="FIND YOUR LEARNING PATH"
      />
      <MetricCards
        items={[
          { label: '可选路径', value: learningPaths.length, detail: '面向不同学习目标' },
          { label: '已加入', value: joinedPaths.length, detail: '随时继续或调整' },
          {
            label: '已完成',
            value: joinedPaths.filter((path) => pathProgress(path, state).complete).length,
            detail: '章节与所需测评全部完成',
          },
        ]}
      />
      <div className="ws-path-grid">
        {learningPaths.map((path) => (
          <PathCard
            key={path.id}
            path={path}
            state={state}
            onSelect={() => setSelectedId(path.id)}
          />
        ))}
      </div>
    </>
  );
}
