import { practiceBank, questionById } from './bank';
import { normalizedAnswer } from './grading';
import { integer, record, text, timestamp, newId } from '../../workspace/validation';
import type { PracticeConfig, PracticeRecord, PracticeSession } from './types';

export function availableQuestions(config: PracticeConfig, history: PracticeRecord[]) {
  const seen = new Set(history.flatMap((item) => item.questionIds));
  return practiceBank.filter(
    (question) =>
      (!config.courseId || question.courseId === config.courseId) &&
      (config.kind === 'all' || question.kind === config.kind) &&
      (!config.onlyUnseen || !seen.has(question.id)),
  );
}

export function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.min(index, Math.floor(Math.max(0, random()) * (index + 1)));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function startPractice(
  ids: string[],
  mode: PracticeSession['mode'] = 'practice',
): PracticeSession {
  const questionIds = [...new Set(ids)].filter((id) => questionById.has(id)).slice(0, 30);
  if (!questionIds.length) throw new Error('没有符合条件的题目，请调整筛选。');
  return {
    id: newId('practice'),
    questionIds,
    answers: {},
    index: 0,
    startedAt: new Date().toISOString(),
    mode,
  };
}

export function answerQuestion(
  session: PracticeSession,
  id: string,
  answer: number[],
): PracticeSession {
  const question = questionById.get(id);
  if (!question || !session.questionIds.includes(id)) return session;
  return { ...session, answers: { ...session.answers, [id]: normalizedAnswer(question, answer) } };
}

export function parseSession(value: unknown): PracticeSession | null {
  const raw = record(value);
  const startedAt = timestamp(raw.startedAt);
  const questionIds = Array.isArray(raw.questionIds)
    ? [
        ...new Set(
          raw.questionIds.filter(
            (id): id is string => typeof id === 'string' && questionById.has(id),
          ),
        ),
      ].slice(0, 30)
    : [];
  if (!text(raw.id) || !startedAt || !questionIds.length) return null;
  const answers = record(raw.answers);
  return {
    id: text(raw.id),
    startedAt,
    questionIds,
    mode: raw.mode === 'review' ? 'review' : 'practice',
    index: integer(raw.index, 0, questionIds.length - 1),
    answers: Object.fromEntries(
      questionIds.map((id) => [id, normalizedAnswer(questionById.get(id)!, answers[id])]),
    ),
  };
}

export function parsePracticeRecord(value: unknown): PracticeRecord | null {
  const session = parseSession(value);
  const finishedAt = timestamp(record(value).finishedAt);
  if (!session || !finishedAt || finishedAt < session.startedAt) return null;
  return {
    id: session.id,
    questionIds: session.questionIds,
    answers: session.answers,
    startedAt: session.startedAt,
    finishedAt,
    mode: session.mode,
  };
}
