import type { AssignmentSubmission } from './types';

export default function SubmissionHistory({
  submissions,
  selected,
  onSelect,
}: {
  submissions: AssignmentSubmission[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  if (!submissions.length) return null;
  return (
    <section className="panel ws-submission-history">
      <h3>提交版本</h3>
      <p>每次提交都保留内容快照，便于回看改进过程。</p>
      <div>
        {[...submissions].reverse().map((item, index) => (
          <button
            key={item.id}
            className={`ws-history-row ${selected === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span>
              <strong>第 {submissions.length - index} 版</strong>
              <small>{new Date(item.submittedAt).toLocaleString('zh-CN')}</small>
            </span>
            <b>{item.body.length} 字</b>
          </button>
        ))}
      </div>
    </section>
  );
}
