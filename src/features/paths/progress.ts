import { courses, exams, courseProgress, type LearningState } from '../../domain';
import type { LearningPath } from './types';

export function pathProgress(path: LearningPath, state: LearningState) {
  let unlocked = true;
  const steps = path.steps.map((step, index) => {
    const course = courses.find((item) => item.id === step.courseId)!;
    const exam = exams.find((item) => item.courseId === step.courseId);
    const progress = courseProgress(course, state.completed);
    const passed =
      !step.requireExam ||
      (!!exam &&
        state.attempts.some((attempt) => attempt.examId === exam.id && attempt.score >= exam.pass));
    const complete = progress === 100 && passed;
    const available = unlocked;
    unlocked = unlocked && complete;
    return { ...step, index, course, exam, progress, passed, complete, available };
  });
  const finished = steps.filter((step) => step.complete).length;
  const units = steps.reduce(
    (sum, step) => sum + step.course.lessons.length + Number(step.requireExam),
    0,
  );
  const doneUnits = steps.reduce(
    (sum, step) =>
      sum +
      step.course.lessons.filter((lesson) => state.completed.includes(lesson.id)).length +
      Number(step.requireExam && step.passed),
    0,
  );
  return {
    steps,
    finished,
    total: steps.length,
    percent: Math.round((doneUnits / units) * 100),
    complete: finished === steps.length,
    next: steps.find((step) => step.available && !step.complete),
    minutes: steps.reduce(
      (sum, step) => sum + step.course.lessons.reduce((total, lesson) => total + lesson.minutes, 0),
      0,
    ),
  };
}
