// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { LearningProvider, STORAGE_KEY, initialState } from '../../store';
import { practiceBank } from './bank';
import { startPractice } from './session';
import Practice from '../../pages/Practice';

beforeEach(() => localStorage.clear());
afterEach(cleanup);
const mount = () =>
  render(
    <LearningProvider>
      <Practice />
    </LearningProvider>,
  );

it('preserves multiple choices through pause and reload, then reviews and retries', () => {
  const question = practiceBank.find((item) => item.kind === 'multiple')!;
  const state = initialState();
  state.practiceSession = startPractice([question.id]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const app = mount();
  expect(
    screen.getByRole('progressbar', { name: '已作答 0 / 1' }).getAttribute('aria-valuenow'),
  ).toBe('0');
  for (const index of question.correct)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(question.options[index]) }));
  expect(
    screen.getByRole('progressbar', { name: '已作答 1 / 1' }).getAttribute('aria-valuenow'),
  ).toBe('100');
  fireEvent.click(screen.getByRole('button', { name: '暂停练习' }));
  expect(screen.getByRole('button', { name: '开始练习' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: '继续上次练习' }));
  app.unmount();
  mount();
  for (const index of question.correct)
    expect(
      screen
        .getByRole('button', { name: new RegExp(question.options[index]) })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: '完成练习' }));
  expect(screen.queryByText('本次答对 1 / 1 题 · 0 题未作答')).not.toBeNull();
  expect(screen.queryByText(question.explanation)).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '返回练习中心' }));
  expect(screen.queryByText('最近练习')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /专项练习.*1\/1 题/ }));
  fireEvent.click(screen.getByRole('button', { name: '再做一次' }));
  expect(screen.queryByText(question.prompt)).not.toBeNull();
  expect(screen.queryByText('参考答案')).toBeNull();
});

it('scores unanswered work as zero and places it in the review queue', () => {
  const state = initialState();
  state.practiceSession = startPractice([practiceBank[0].id]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  mount();
  fireEvent.click(screen.getByRole('button', { name: '完成练习' }));
  expect(screen.queryByText('本次答对 0 / 1 题 · 1 题未作答')).not.toBeNull();
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(saved.practiceHistory).toHaveLength(1);
  expect(saved.reviewSchedule[0].lastCorrect).toBe(false);
  expect(saved.practiceSession).toBeNull();
});
