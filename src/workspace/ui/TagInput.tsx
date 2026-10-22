import { useState } from 'react';
import { tags as normalizeTags } from '../validation';

export default function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    onChange(normalizeTags([...value, ...draft.split(/[,，]/)]));
    setDraft('');
  };
  return (
    <div className="ws-tag-input">
      <label className="form-field">
        标签（最多 8 个）
        <input
          value={draft}
          maxLength={100}
          placeholder="输入后按回车，或用逗号分隔"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={add}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
        />
      </label>
      <div className="ws-tags">
        {value.map((tag) => (
          <button
            type="button"
            key={tag}
            aria-label={`移除标签${tag}`}
            onClick={() => onChange(value.filter((item) => item !== tag))}
          >
            {tag} ×
          </button>
        ))}
      </div>
    </div>
  );
}
