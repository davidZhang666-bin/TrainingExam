import type { PracticeQuestion, PracticeRecord, PracticeSession } from './types';
import { questionById } from './bank';

export function normalizedAnswer(question: PracticeQuestion, answer: unknown): number[] {
  if (!Array.isArray(answer)) return [];
  const valid = [
    ...new Set(
      answer.filter(
        (index): index is number =>
          Number.isInteger(index) && index >= 0 && index < question.options.length,
      ),
    ),
  ].sort((a, b) => a - b);
  return question.kind === 'multiple' ? valid : valid.slice(0, 1);
}

export function isCorrect(question: PracticeQuestion, answer: number[] | undefined): boolean {
  if (!answer || new Set(answer).size !== answer.length) return false;
  return (
    answer.length === question.correct.length &&
    question.correct.every((index) => answer.includes(index))
  );
}

export function gradePractice(session: Pick<PracticeSession, 'questionIds' | 'answers'>) {
  const rows = session.questionIds.flatMap((id) => {
    const question = questionById.get(id);
    if (!question) return [];
    const answer = session.answers[id] ?? [];
    return [
      { question, answer, correct: isCorrect(question, answer), unanswered: answer.length === 0 },
    ];
  });
  const correct = rows.filter((row) => row.correct).length;
  return {
    rows,
    correct,
    total: rows.length,
    score: rows.length ? Math.round((correct / rows.length) * 100) : 0,
    unanswered: rows.filter((row) => row.unanswered).length,
  };
}

export function finishPractice(session: PracticeSession, now = new Date()): PracticeRecord {
  return {
    id: session.id,
    questionIds: [...session.questionIds],
    answers: Object.fromEntries(
      Object.entries(session.answers).map(([id, answer]) => [id, [...answer]]),
    ),
    startedAt: session.startedAt,
    finishedAt: now.toISOString(),
    mode: session.mode,
  };
}
