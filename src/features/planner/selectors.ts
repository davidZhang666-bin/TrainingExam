import type { StudyTask } from './types';
import { dateKey, shiftDate, weekStart } from '../../workspace/dates';

export function orderTasks(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort(
    (a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`) || a.id.localeCompare(b.id),
  );
}

export function taskStats(tasks: StudyTask[], today = dateKey()) {
  const start = weekStart(today);
  const end = shiftDate(start, 6);
  const week = tasks.filter((task) => task.date >= start && task.date <= end);
  return {
    today: tasks.filter((task) => task.date === today && task.status !== 'done').length,
    overdue: tasks.filter((task) => task.date < today && task.status !== 'done').length,
    weekMinutes: week.reduce((sum, task) => sum + task.minutes, 0),
    completed: week.filter((task) => task.status === 'done').length,
    weekCount: week.length,
  };
}

export function conflictsFor(
  task: Pick<StudyTask, 'date' | 'time' | 'minutes'>,
  tasks: StudyTask[],
  exceptId?: string,
) {
  const start = minutesOfDay(task.time);
  return tasks.filter((other) => {
    if (other.id === exceptId || other.date !== task.date || other.status === 'done') return false;
    const otherStart = minutesOfDay(other.time);
    return start < otherStart + other.minutes && otherStart < start + task.minutes;
  });
}

function minutesOfDay(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}
