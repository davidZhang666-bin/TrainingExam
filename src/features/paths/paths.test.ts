import { describe, expect, it } from 'vitest';
import { courses, exams } from '../../domain';
import { initialState } from '../../persistence';
import { learningPaths } from './catalog';
import { pathProgress } from './progress';

describe('ordered learning paths', () => {
  it('keeps later stages locked until all chapters and the required exam are completed', () => {
    const path = learningPaths.find((item) => item.id === 'problem-solving')!;
    const state = initialState();
    state.completed = courses
      .find((course) => course.id === 'design')!
      .lessons.map((lesson) => lesson.id);
    expect(pathProgress(path, state).steps[1].available).toBe(false);
    const exam = exams.find((item) => item.courseId === 'design')!;
    state.attempts = [
      {
        id: 'pass',
        examId: exam.id,
        score: exam.pass,
        answers: {},
        submittedAt: new Date().toISOString(),
      },
    ];
    expect(pathProgress(path, state).steps[1].available).toBe(true);
    expect(pathProgress(path, state).finished).toBe(1);
  });
  it('counts existing progress and finishes courses without an exam when none is required', () => {
    const path = learningPaths.find((item) => item.id === 'onboarding')!;
    const state = initialState();
    state.completed = courses
      .filter((course) => path.steps.some((step) => step.courseId === course.id))
      .flatMap((course) => course.lessons.map((lesson) => lesson.id));
    const exam = exams.find((item) => item.courseId === 'security')!;
    state.attempts = [
      {
        id: 'pass',
        examId: exam.id,
        score: 100,
        answers: {},
        submittedAt: new Date().toISOString(),
      },
    ];
    expect(pathProgress(path, state).complete).toBe(true);
    expect(pathProgress(path, state).percent).toBe(100);
  });
});
