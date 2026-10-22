import type { StudyTask } from './types';

export function escapeCalendar(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function localTimestamp(date: Date): string {
  const part = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${part(date.getMonth() + 1)}${part(date.getDate())}T${part(date.getHours())}${part(date.getMinutes())}00`;
}

export function foldCalendarLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  for (const character of line) {
    if (encoder.encode(current + character).length > 73) {
      parts.push(current);
      current = ' ';
    }
    current += character;
  }
  parts.push(current);
  return parts.join('\r\n');
}

export function tasksToCalendar(tasks: StudyTask[], now = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zhixu Academy//Learning Plan//ZH',
    'CALSCALE:GREGORIAN',
  ];
  for (const task of tasks) {
    const start = new Date(`${task.date}T${task.time}:00`);
    const end = new Date(start.getTime() + task.minutes * 60_000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeCalendar(task.id)}@zhixu.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${localTimestamp(start)}`,
      `DTEND:${localTimestamp(end)}`,
      `SUMMARY:${escapeCalendar(task.title)}`,
      `DESCRIPTION:${escapeCalendar(task.description)}`,
      `STATUS:${task.status === 'done' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldCalendarLine).join('\r\n') + '\r\n';
}
