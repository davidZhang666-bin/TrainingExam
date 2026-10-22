export type QuestionKind = 'single' | 'multiple' | 'boolean';
export interface PracticeQuestion {
  id: string;
  courseId: string;
  skill: string;
  kind: QuestionKind;
  difficulty: '基础' | '应用';
  prompt: string;
  options: string[];
  correct: number[];
  explanation: string;
}
export interface PracticeSession {
  id: string;
  questionIds: string[];
  answers: Record<string, number[]>;
  index: number;
  startedAt: string;
  mode: 'practice' | 'review';
}
export interface PracticeRecord {
  id: string;
  questionIds: string[];
  answers: Record<string, number[]>;
  startedAt: string;
  finishedAt: string;
  mode: 'practice' | 'review';
}
export interface ReviewItem {
  questionId: string;
  interval: number;
  streak: number;
  due: string;
  lastCorrect: boolean;
  attempts: number;
}
export interface PracticeConfig {
  courseId: string;
  kind: 'all' | QuestionKind;
  count: number;
  onlyUnseen: boolean;
}
export const kindNames: Record<QuestionKind, string> = {
  single: '单选题',
  multiple: '多选题',
  boolean: '判断题',
};
