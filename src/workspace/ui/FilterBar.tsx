import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

export default function FilterBar({
  query,
  onQuery,
  label,
  children,
}: {
  query: string;
  onQuery: (value: string) => void;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="ws-filters">
      <label className="ws-search">
        <Search size={17} />
        <input
          aria-label={label}
          placeholder={label}
          value={query}
          maxLength={100}
          onChange={(event) => onQuery(event.target.value)}
        />
        {query && (
          <button type="button" onClick={() => onQuery('')} aria-label="清空搜索">
            ×
          </button>
        )}
      </label>
      {children}
    </div>
  );
}
