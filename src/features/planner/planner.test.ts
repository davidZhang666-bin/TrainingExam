import { describe, expect, it } from 'vitest';
import { validateTask, parseTask } from './validation';
import { conflictsFor, taskStats } from './selectors';
import { calendarWeek } from './calendar';
import { tasksToCalendar } from './ics';
import type { StudyTask, TaskInput } from './types';

const input: TaskInput = {
  title: '复习设计方法',
  date: '2026-10-22',
  time: '18:00',
  minutes: 30,
  kind: 'course',
  courseId: 'design',
  description: '原型验证',
};
const task: StudyTask = {
  ...input,
  id: 'one',
  status: 'planned',
  createdAt: '2026-10-22T01:00:00Z',
  completedAt: null,
};
describe('calendar plans', () => {
  it('rejects impossible dates, cross-midnight plans, unknown courses and invalid duration', () => {
    expect(validateTask(input)).toEqual([]);
    for (const changes of [
      { date: '2026-02-30' },
      { minutes: 4 },
      { time: '24:00' },
      { time: '23:50' },
      { courseId: 'missing' },
    ])
      expect(validateTask({ ...input, ...changes }).length).toBeGreaterThan(0);
    expect(parseTask({ ...task, date: 'not-a-date' })).toBeNull();
  });
  it('detects overlap, allows touching boundaries and excludes the edited task', () => {
    expect(conflictsFor({ ...task, time: '18:29' }, [task])).toHaveLength(1);
    expect(conflictsFor({ ...task, time: '18:30' }, [task])).toHaveLength(0);
    expect(conflictsFor(task, [task], task.id)).toHaveLength(0);
    expect(conflictsFor({ ...task, date: '2026-10-23' }, [task])).toHaveLength(0);
    expect(conflictsFor(task, [{ ...task, status: 'done' }])).toHaveLength(0);
  });
  it('uses Monday-to-Sunday weeks across year boundaries and tracks unfinished overdue items', () => {
    const week = calendarWeek('2027-01-01', []);
    expect(week[0].date).toBe('2026-12-28');
    expect(week[6].date).toBe('2027-01-03');
    const stats = taskStats(
      [task, { ...task, id: 'two', date: '2026-10-21', status: 'done' }],
      '2026-10-23',
    );
    expect(stats.overdue).toBe(1);
    expect(stats.weekMinutes).toBe(60);
    expect(stats.completed).toBe(1);
  });
  it('exports escaped, UTF-8 folded calendar events with correct start and end times', () => {
    const calendar = tasksToCalendar(
      [{ ...task, title: '中文'.repeat(70), description: 'A;B,C\nD\\E' }],
      new Date('2026-10-22T01:00:00Z'),
    );
    expect(calendar).toContain('DTSTART:20261022T180000');
    expect(calendar).toContain('DTEND:20261022T183000');
    expect(calendar).toContain('DESCRIPTION:A\\;B\\,C\\nD\\\\E');
    for (const line of calendar.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(calendar).toMatch(/END:VCALENDAR\r\n$/);
  });
});
