import { describe, expect, it } from 'vitest';
import { practiceBank, questionById } from './bank';
import { gradePractice, isCorrect, finishPractice } from './grading';
import {
  availableQuestions,
  startPractice,
  answerQuestion,
  parseSession,
  parsePracticeRecord,
  shuffled,
} from './session';
import { reviewSchedule, updateReview } from './scheduling';

describe('practice scoring and recovery', () => {
  it('has unique valid questions and awards credit to exactly the complete answer set', () => {
    expect(questionById.size).toBe(practiceBank.length);
    for (const question of practiceBank) {
      expect(question.correct.every((index) => index >= 0 && index < question.options.length)).toBe(
        true,
      );
      expect(isCorrect(question, question.correct)).toBe(true);
      expect(isCorrect(question, [])).toBe(false);
      expect(isCorrect(question, [...question.correct, 999])).toBe(false);
    }
    const multiple = practiceBank.find((question) => question.kind === 'multiple')!;
    expect(isCorrect(multiple, multiple.correct.slice(1))).toBe(false);
    expect(isCorrect(multiple, [...multiple.correct].reverse())).toBe(true);
    expect(isCorrect(multiple, [...multiple.correct, multiple.correct[0]])).toBe(false);
  });
  it('preserves immutable session snapshots and repairs invalid answers and indexes', () => {
    const question = practiceBank[0];
    const session = startPractice([question.id, question.id, 'invalid']);
    const answered = answerQuestion(session, question.id, question.correct);
    const record = finishPractice(answered);
    answered.answers[question.id].push(999);
    expect(gradePractice(record).score).toBe(100);
    expect(session.answers).toEqual({});
    expect(
      parseSession({ ...session, index: 100, answers: { [question.id]: [999, -1] } })?.index,
    ).toBe(0);
    expect(parseSession({ ...session, questionIds: ['missing'] })).toBeNull();
    expect(parsePracticeRecord({ ...record, finishedAt: '2000-01-01T00:00:00Z' })).toBeNull();
  });
  it('filters by course, type and unseen questions and shuffles without losing questions', () => {
    const question = practiceBank[0];
    const record = finishPractice(startPractice([question.id]));
    const candidates = availableQuestions(
      { courseId: question.courseId, kind: question.kind, count: 5, onlyUnseen: true },
      [record],
    );
    expect(
      candidates.every(
        (item) =>
          item.courseId === question.courseId &&
          item.kind === question.kind &&
          item.id !== question.id,
      ),
    ).toBe(true);
    expect(new Set(shuffled(practiceBank, () => 0)).size).toBe(practiceBank.length);
  });
  it('extends correct review intervals, resets errors and avoids duplicate submissions', () => {
    const id = practiceBank[0].id;
    let item = updateReview(undefined, id, true, '2026-10-22');
    expect(item.due).toBe('2026-10-23');
    item = updateReview(item, id, true, '2026-10-23');
    expect(item.interval).toBe(3);
    item = updateReview(item, id, false, '2026-10-26');
    expect(item.streak).toBe(0);
    expect(item.due).toBe('2026-10-27');
    const record = finishPractice(startPractice([id]));
    expect(reviewSchedule([record, record])[0].attempts).toBe(1);
  });
});
