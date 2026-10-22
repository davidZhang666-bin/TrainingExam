// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LearningProvider } from '../../store';
import StudyPlanner from '../../pages/StudyPlanner';

beforeEach(() => localStorage.clear());
afterEach(cleanup);
const mount = () =>
  render(
    <LearningProvider>
      <StudyPlanner onLearn={vi.fn()} />
    </LearningProvider>,
  );

it('creates and edits a plan, rejects overlap and preserves completion across remounts', () => {
  const app = mount();
  fireEvent.click(screen.getByRole('button', { name: '新建计划' }));
  fireEvent.change(screen.getByLabelText('计划名称'), { target: { value: '本周阅读' } });
  fireEvent.click(screen.getByRole('button', { name: '保存计划' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '修改' }));
  fireEvent.change(screen.getByLabelText('计划名称'), { target: { value: '深入阅读' } });
  fireEvent.click(screen.getByRole('button', { name: '保存计划' }));
  fireEvent.click(screen.getByRole('button', { name: '新建计划' }));
  fireEvent.change(screen.getByLabelText('计划名称'), { target: { value: '重复时段' } });
  fireEvent.click(screen.getByRole('button', { name: '保存计划' }));
  expect(screen.getByRole('alert').textContent).toContain('时间重叠');
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  fireEvent.click(screen.getByRole('button', { name: '完成深入阅读' }));
  app.unmount();
  mount();
  expect(
    screen.getByRole('button', { name: '重新打开深入阅读' }).getAttribute('aria-pressed'),
  ).toBe('true');
});

it('opens the selected calendar date and requires confirmation before deleting', () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: /周一/ }));
  const chosen = (screen.getByLabelText('日期') as HTMLInputElement).value;
  expect(new Date(chosen + 'T12:00:00').getDay()).toBe(1);
  fireEvent.change(screen.getByLabelText('计划名称'), { target: { value: '周一复习' } });
  fireEvent.click(screen.getByRole('button', { name: '保存计划' }));
  fireEvent.click(screen.getByRole('button', { name: '删除周一复习' }));
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  expect(screen.queryByText('周一复习')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '删除周一复习' }));
  fireEvent.click(screen.getByRole('button', { name: '删除计划' }));
  expect(screen.queryByText('周一复习')).toBeNull();
});
