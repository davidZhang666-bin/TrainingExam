import { useState } from 'react';
import { ArrowLeft, Download, Save } from 'lucide-react';
import { useLearning } from '../store';
import PageIntro from '../components/PageIntro';
import { assignments } from '../features/assignments/catalog';
import { assignmentStats, latestSubmission } from '../features/assignments/selectors';
import { submissionErrors } from '../features/assignments/validation';
import type { Assignment } from '../features/assignments/types';
import AssignmentCard from '../features/assignments/AssignmentCard';
import RubricChecklist from '../features/assignments/RubricChecklist';
import SubmissionHistory from '../features/assignments/SubmissionHistory';
import StatusBanner from '../workspace/ui/StatusBanner';
import MetricCards from '../workspace/ui/MetricCards';
import ConfirmDialog from '../workspace/ui/ConfirmDialog';
import { newId } from '../workspace/validation';
import { downloadFile } from '../downloads';
import { safeFilename } from '../features/notebook/export';

export default function Assignments() {
  const { state } = useLearning();
  const [selected, setSelected] = useState<Assignment | null>(null);
  const stats = assignmentStats(state.assignmentDrafts, state.assignmentSubmissions);
  if (selected)
    return (
      <AssignmentWorkspace
        key={selected.id}
        assignment={selected}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <>
      <PageIntro
        title="把所学，试着用一次"
        subtitle="在小型工作情境中实践，保存成果，再写一点自己的反思。"
        eyebrow="KNOWLEDGE INTO PRACTICE"
      />
      <MetricCards
        items={[
          { label: '实践任务', value: stats.total, detail: '与课程知识关联' },
          { label: '已提交自评', value: stats.submitted, detail: '保留每次提交快照' },
          { label: '进行中草稿', value: stats.drafts, detail: '输入后自动保存在本机' },
          { label: '反思记录', value: stats.reflections, detail: '用复盘连接下一次行动' },
        ]}
      />
      <div className="ws-assignment-grid">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            status={
              state.assignmentSubmissions.some((item) => item.assignmentId === assignment.id)
                ? 'submitted'
                : state.assignmentDrafts.some(
                      (item) => item.id === assignment.id && item.body.trim(),
                    )
                  ? 'draft'
                  : 'new'
            }
            onOpen={() => setSelected(assignment)}
          />
        ))}
      </div>
    </>
  );
}

function AssignmentWorkspace({
  assignment,
  onBack,
}: {
  assignment: Assignment;
  onBack: () => void;
}) {
  const { state, saveAssignmentDraft, submitAssignment, saveAssignmentReflection } = useLearning();
  const draft = state.assignmentDrafts.find((item) => item.id === assignment.id);
  const submissions = state.assignmentSubmissions.filter(
    (item) => item.assignmentId === assignment.id,
  );
  const [body, setBody] = useState(draft?.body ?? '');
  const [checks, setChecks] = useState(draft?.checks ?? []);
  const [viewId, setViewId] = useState(
    draft ? '' : (latestSubmission(submissions, assignment.id)?.id ?? ''),
  );
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const viewed = submissions.find((item) => item.id === viewId);
  const save = (nextBody: string, nextChecks: string[]) => {
    setBody(nextBody);
    setChecks(nextChecks);
    setError('');
    saveAssignmentDraft({
      id: assignment.id,
      body: nextBody,
      checks: nextChecks,
      updatedAt: new Date().toISOString(),
    });
  };
  return (
    <>
      <button className="text-button back-link" onClick={onBack}>
        <ArrowLeft size={14} /> 返回实践作业
      </button>
      <PageIntro title={assignment.title} subtitle={assignment.brief} eyebrow="TRY, REFLECT, GROW">
        {viewed && (
          <button
            className="button"
            onClick={() => {
              save(viewed.body, [...viewed.checks]);
              setViewId('');
            }}
          >
            基于此版继续改进
          </button>
        )}
        <button
          className="button"
          disabled={!(viewed?.body ?? body).trim()}
          onClick={() =>
            downloadFile(
              `${safeFilename(assignment.title)}.md`,
              `# ${assignment.title}\n\n${viewed?.body ?? body}\n\n## 自我反思\n\n${viewed?.reflection ?? ''}\n`,
              'text/markdown;charset=utf-8',
            )
          }
        >
          <Download size={14} />
          导出作业
        </button>
      </PageIntro>
      <div className="ws-assignment-layout">
        <div className="stack">
          <section className="panel ws-assignment-brief">
            <h2>实践情境</h2>
            <p>{assignment.context}</p>
            <h3>需要完成什么</h3>
            <p>{assignment.deliverable}</p>
            <span className="badge">
              建议 {assignment.minutes} 分钟 · 至少 {assignment.minLength} 字
            </span>
          </section>
          <section className="panel ws-assignment-editor">
            <div className="panel-heading">
              <h2>{viewed ? '提交内容快照' : '我的实践内容'}</h2>
              <small>
                {viewed
                  ? new Date(viewed.submittedAt).toLocaleString('zh-CN')
                  : '输入后自动保存草稿'}
              </small>
            </div>
            {viewed ? (
              <div className="ws-text-content">{viewed.body}</div>
            ) : (
              <label className="form-field">
                作业内容
                <textarea
                  aria-label="作业内容"
                  rows={16}
                  maxLength={12000}
                  value={body}
                  onChange={(event) => save(event.target.value, checks)}
                  placeholder="按情境写出你的分析和行动计划"
                />
                <small>{body.trim().length} / 12000 字</small>
              </label>
            )}
            <RubricChecklist
              rubric={assignment.rubric}
              checks={viewed?.checks ?? checks}
              readOnly={!!viewed}
              onChange={(next) => save(body, next)}
            />
            <StatusBanner message={error} tone="error" />
            {!viewed && (
              <div className="dialog-actions">
                <span className="ws-muted">
                  <Save size={14} /> 草稿保存在当前浏览器
                </span>
                <button
                  className="button primary"
                  onClick={() => {
                    const errors = submissionErrors(assignment, body, checks);
                    if (errors.length) {
                      setError(errors.join(' '));
                      return;
                    }
                    setConfirm(true);
                  }}
                >
                  提交自评记录
                </button>
              </div>
            )}
          </section>
          {viewed && (
            <section className="panel ws-assignment-reflection">
              <h2>留一点反思，给下一次实践</h2>
              <p>哪里做得好？还缺什么证据？下一次准备怎样改进？</p>
              <label className="form-field">
                本版反思
                <textarea
                  maxLength={2000}
                  rows={5}
                  value={viewed.reflection}
                  onChange={(event) => saveAssignmentReflection(viewed.id, event.target.value)}
                  placeholder="写给未来的自己，输入后自动保存"
                />
              </label>
              <small>这是个人实践与自评记录，尚未接入讲师评分。</small>
            </section>
          )}
        </div>
        <SubmissionHistory submissions={submissions} selected={viewId} onSelect={setViewId} />
      </div>
      {confirm && (
        <ConfirmDialog
          title="保存本次自评记录？"
          description="提交会保留当前内容与自查项的快照。之后可以基于这一版继续改进。"
          confirm="确认提交自评"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            const id = newId('submission');
            submitAssignment({
              id,
              assignmentId: assignment.id,
              body: body.trim(),
              checks: [...checks],
              submittedAt: new Date().toISOString(),
              reflection: '',
            });
            setViewId(id);
          }}
        />
      )}
    </>
  );
}
