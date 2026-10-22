// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LearningProvider, initialState, STORAGE_KEY } from '../../store';
import { courses, exams } from '../../domain';
import LearningPaths from '../../pages/LearningPaths';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('unlocks the first step on joining and keeps course records when leaving', () => {
  const onLearn = vi.fn();
  render(
    <LearningProvider>
      <LearningPaths onLearn={onLearn} onExam={vi.fn()} />
    </LearningProvider>,
  );
  fireEvent.click(screen.getAllByRole('button', { name: '了解学习路径' })[0]);
  expect(screen.queryByRole('button', { name: '继续学习' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '加入学习路径' }));
  expect(screen.getAllByRole('button', { name: '继续学习' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: '继续学习' }));
  expect(onLearn).toHaveBeenCalledWith('security');
  fireEvent.click(screen.getByRole('button', { name: '退出路径' }));
  fireEvent.click(screen.getAllByRole('button', { name: '退出路径' })[1]);
  expect(screen.queryByRole('button', { name: '加入学习路径' })).not.toBeNull();
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(state.pathEnrollments).toEqual({});
  expect(state.enrolled).toContain('security');
  expect(state.completed).toContain('design-1');
});

it('requires both course completion and a passing exam for the next step', () => {
  const state = initialState();
  state.completed.push(
    ...courses.find((item) => item.id === 'security')!.lessons.map((item) => item.id),
  );
  state.pathEnrollments.onboarding = { id: 'path-test', startedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const onExam = vi.fn();
  const app = render(
    <LearningProvider>
      <LearningPaths onLearn={vi.fn()} onExam={onExam} />
    </LearningProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '查看我的路径' }));
  expect(screen.queryByRole('button', { name: '继续学习' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '去测评' }));
  expect(onExam).toHaveBeenCalledOnce();
  app.unmount();
  const exam = exams.find((item) => item.courseId === 'security')!;
  state.attempts = [
    {
      id: 'passed-security',
      examId: exam.id,
      answers: Object.fromEntries(exam.questions.map((item) => [item.id, item.answer])),
      score: 100,
      submittedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render(
    <LearningProvider>
      <LearningPaths onLearn={vi.fn()} onExam={onExam} />
    </LearningProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '查看我的路径' }));
  expect(screen.getAllByRole('button', { name: '继续学习' })).toHaveLength(1);
});
