import { localDate } from './persistence';
export function calendarWeek(now = new Date()) {
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    return { date: localDate(day), label: day.toLocaleDateString('zh-CN', { weekday: 'short' }) };
  });
}
