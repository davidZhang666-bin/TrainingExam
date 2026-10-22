import { courses } from '../../domain';
import { validDate } from '../../workspace/dates';
import { record, text, integer, timestamp } from '../../workspace/validation';
import { taskKindNames, type StudyTask, type TaskInput, type TaskKind } from './types';

export function validateTask(input: TaskInput): string[] {
  const errors: string[] = [];
  if (!input.title.trim() || input.title.length > 80) errors.push('标题需要 1–80 个字符。');
  if (!validDate(input.date)) errors.push('请选择有效日期。');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) errors.push('请选择有效开始时间。');
  if (!Number.isInteger(input.minutes) || input.minutes < 5 || input.minutes > 240)
    errors.push('计划时长应为 5–240 分钟。');
  const [hour, minute] = input.time.split(':').map(Number);
  if (hour * 60 + minute + input.minutes > 1440)
    errors.push('单次计划应在当天结束，请拆分跨日安排。');
  if (input.courseId && !courses.some((course) => course.id === input.courseId))
    errors.push('关联课程不存在。');
  if (!(input.kind in taskKindNames)) errors.push('请选择计划类型。');
  if (input.description.length > 1000) errors.push('计划说明不能超过 1000 字。');
  return errors;
}

export function parseTask(value: unknown): StudyTask | null {
  const raw = record(value);
  if (!text(raw.id) || !validDate(raw.date) || !timestamp(raw.createdAt)) return null;
  const kind = Object.hasOwn(taskKindNames, text(raw.kind)) ? (raw.kind as TaskKind) : 'reading';
  const input: TaskInput = {
    title: text(raw.title, 80),
    date: raw.date,
    time: text(raw.time, 5),
    minutes: integer(raw.minutes, 5, 240, 25),
    kind,
    courseId: courses.some((course) => course.id === raw.courseId) ? String(raw.courseId) : '',
    description: text(raw.description, 1000),
  };
  if (validateTask(input).length) return null;
  return {
    ...input,
    id: text(raw.id),
    status: raw.status === 'done' ? 'done' : 'planned',
    createdAt: timestamp(raw.createdAt)!,
    completedAt: raw.status === 'done' ? timestamp(raw.completedAt) : null,
  };
}
