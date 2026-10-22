import { dateKey, shiftDate } from '../../workspace/dates';
import { questionById } from './bank';
import { isCorrect } from './grading';
import type { PracticeRecord, ReviewItem } from './types';

export function updateReview(
  previous: ReviewItem | undefined,
  questionId: string,
  correct: boolean,
  day: string,
): ReviewItem {
  const streak = correct ? (previous?.streak ?? 0) + 1 : 0;
  const interval = correct
    ? Math.min(30, streak === 1 ? 1 : streak === 2 ? 3 : (previous?.interval ?? 3) * 2)
    : 1;
  return {
    questionId,
    interval,
    streak,
    due: shiftDate(day, interval),
    lastCorrect: correct,
    attempts: (previous?.attempts ?? 0) + 1,
  };
}

export function reviewSchedule(history: PracticeRecord[]): ReviewItem[] {
  const schedule = new Map<string, ReviewItem>();
  const seen = new Set<string>();
  for (const record of [...history].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    const day = dateKey(new Date(record.finishedAt));
    for (const id of record.questionIds) {
      const question = questionById.get(id);
      if (question)
        schedule.set(
          id,
          updateReview(schedule.get(id), id, isCorrect(question, record.answers[id]), day),
        );
    }
  }
  return [...schedule.values()].sort(
    (a, b) => a.due.localeCompare(b.due) || a.questionId.localeCompare(b.questionId),
  );
}
