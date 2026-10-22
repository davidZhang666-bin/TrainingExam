import type { Assignment } from './types';

export default function RubricChecklist({
  rubric,
  checks,
  onChange,
  readOnly = false,
}: {
  rubric: Assignment['rubric'];
  checks: string[];
  onChange?: (checks: string[]) => void;
  readOnly?: boolean;
}) {
  return (
    <fieldset className="ws-rubric">
      <legend>提交前自查</legend>
      <p>逐项核对自己的内容。勾选表示已经自行检查，不代表人工评阅或自动评分。</p>
      {rubric.map((item) => (
        <label key={item.id}>
          <input
            type="checkbox"
            disabled={readOnly}
            checked={checks.includes(item.id)}
            onChange={(event) =>
              onChange?.(
                event.target.checked ? [...checks, item.id] : checks.filter((id) => id !== item.id),
              )
            }
          />
          <span>
            <strong>{item.label}</strong>
            <small>{item.guidance}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
