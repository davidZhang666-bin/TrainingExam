import { dateKey, shiftDate, weekStart } from '../../workspace/dates';
import type { StudyTask } from './types';
import { orderTasks } from './selectors';

export function calendarWeek(anchor: string, tasks: StudyTask[], today = dateKey()) {
  const start = weekStart(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(start, index);
    const items = orderTasks(tasks.filter((task) => task.date === date));
    return {
      date,
      label: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index],
      number: Number(date.slice(-2)),
      today: date === today,
      tasks: items,
      minutes: items.reduce((total, task) => total + task.minutes, 0),
    };
  });
}
