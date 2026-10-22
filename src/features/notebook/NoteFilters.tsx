import { Archive } from 'lucide-react';
import { courses } from '../../domain';
import FilterBar from '../../workspace/ui/FilterBar';
import type { NoteFilter } from './types';

export default function NoteFilters({
  filter,
  tags,
  onChange,
}: {
  filter: NoteFilter;
  tags: { tag: string; count: number }[];
  onChange: (filter: NoteFilter) => void;
}) {
  return (
    <section className="panel ws-note-filter-panel">
      <FilterBar
        query={filter.query}
        label="搜索笔记"
        onQuery={(query) => onChange({ ...filter, query })}
      >
        <select
          aria-label="笔记课程"
          value={filter.courseId}
          onChange={(event) => onChange({ ...filter, courseId: event.target.value })}
        >
          <option value="">所有课程</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          aria-label="笔记标签"
          value={filter.tag}
          onChange={(event) => onChange({ ...filter, tag: event.target.value })}
        >
          <option value="">全部标签</option>
          {tags.map(({ tag, count }) => (
            <option key={tag} value={tag}>
              #{tag} ({count})
            </option>
          ))}
        </select>
        <select
          aria-label="笔记排序"
          value={filter.sort}
          onChange={(event) =>
            onChange({ ...filter, sort: event.target.value as NoteFilter['sort'] })
          }
        >
          <option value="recent">最近更新</option>
          <option value="oldest">最早更新</option>
          <option value="title">标题顺序</option>
        </select>
        <button
          className={`button ${filter.archived ? 'primary' : ''}`}
          aria-pressed={filter.archived}
          onClick={() => onChange({ ...filter, archived: !filter.archived })}
        >
          <Archive size={14} />
          {filter.archived ? '查看未归档' : '归档笔记'}
        </button>
      </FilterBar>
    </section>
  );
}
