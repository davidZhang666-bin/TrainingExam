export type TaskStatus = 'planned' | 'done';
export type TaskKind = 'course' | 'practice' | 'assignment' | 'reading';
export interface StudyTask {
  id: string;
  title: string;
  date: string;
  time: string;
  minutes: number;
  kind: TaskKind;
  courseId: string;
  description: string;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
}
export type TaskInput = Omit<StudyTask, 'id' | 'status' | 'completedAt' | 'createdAt'>;
export const taskKindNames: Record<TaskKind, string> = {
  course: '课程学习',
  practice: '专项练习',
  assignment: '实践任务',
  reading: '阅读复盘',
};
