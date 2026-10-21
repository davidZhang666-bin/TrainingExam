import type { Exam, Attempt } from './domain';
export function gradeExam(exam: Exam, answers: Record<string, number>): number {
  return Math.round(exam.questions.filter(q => answers[q.id] === q.answer).length / exam.questions.length * 100);
}
export function buildAttempt(exam: Exam, answers: Record<string, number>, deadline: number): Attempt {
  return { id: exam.id + '-' + deadline, examId: exam.id, answers: { ...answers }, score: gradeExam(exam, answers), submittedAt: new Date().toISOString() };
}
