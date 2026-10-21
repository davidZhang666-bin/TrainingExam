import { courses, courseProgress, exams, type LearningState } from './domain';
import { normalizeState } from './persistence';
export function createBackup(state: LearningState) {
  return JSON.stringify({ app: 'zhixu-academy', version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2);
}
export function parseBackup(text: string): LearningState {
  if (text.length > 2_000_000) throw new Error('备份文件过大，请选择 2 MB 以内的文件。');
  let parsed: unknown;try { parsed=JSON.parse(text); } catch { throw new Error('文件不是有效的 JSON 备份。'); }
  const envelope=parsed as Record<string,unknown> | null;
  if (!envelope || envelope.app!=='zhixu-academy' || envelope.version!==1) throw new Error('请选择由知序学习导出的 v1 备份文件。');
  const data=envelope.data as LearningState | null;
  if (!data || !data.profile || !Array.isArray(data.enrolled) || !Array.isArray(data.completed) || !Array.isArray(data.activity) || !Array.isArray(data.attempts)) throw new Error('备份缺少必要的学习记录，未修改当前数据。');
  return normalizeState(data);
}
export function csvCell(value: string | number): string {
  let text=String(value);if (/^[=+\-@\t\r]/.test(text))text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}
export function reportCsv(state: LearningState) {
  const rows: (string | number)[][]=[['姓名','课程','分类','完成章节','总章节','完成进度(%)','累计学习(分钟)','关联测评最佳分']];
  for (const course of courses.filter(c=>state.enrolled.includes(c.id))) {
    const exam=exams.find(e=>e.courseId===course.id);const scores=state.attempts.filter(a=>a.examId===exam?.id).map(a=>a.score);
    rows.push([state.profile.name,course.title,course.category,course.lessons.filter(l=>state.completed.includes(l.id)).length,course.lessons.length,courseProgress(course,state.completed),state.activity.filter(a=>a.courseId===course.id).reduce((s,a)=>s+a.minutes,0),scores.length?Math.max(...scores):'未测评']);
  }
  return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
