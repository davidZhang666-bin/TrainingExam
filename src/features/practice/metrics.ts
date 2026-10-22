import { gradePractice } from './grading';
import { practiceBank } from './bank';
import type { PracticeRecord } from './types';

export function practiceMetrics(history: PracticeRecord[]) {
  const rows = history.flatMap((record) => gradePractice(record).rows);
  const correct = rows.filter((row) => row.correct).length;
  const skills = [...new Set(practiceBank.map((question) => question.skill))]
    .map((skill) => {
      const answers = rows.filter((row) => row.question.skill === skill);
      return {
        skill,
        answered: answers.length,
        accuracy: answers.length
          ? Math.round((answers.filter((row) => row.correct).length / answers.length) * 100)
          : null,
      };
    })
    .filter((item) => item.answered)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
  return {
    sessions: history.length,
    answers: rows.length,
    correct,
    coverage: new Set(rows.map((row) => row.question.id)).size,
    accuracy: rows.length ? Math.round((correct / rows.length) * 100) : null,
    skills,
  };
}
