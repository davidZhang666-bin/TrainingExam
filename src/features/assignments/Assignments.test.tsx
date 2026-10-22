// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { LearningProvider, STORAGE_KEY } from '../../store';
import { assignments } from './catalog';
import Assignments from '../../pages/Assignments';

beforeEach(() => localStorage.clear());
afterEach(cleanup);
const mount = () =>
  render(
    <LearningProvider>
      <Assignments />
    </LearningProvider>,
  );
const openFirst = (action: string) => {
  const card = screen.getByRole('heading', { name: assignments[0].title }).closest('article')!;
  fireEvent.click(within(card).getByRole('button', { name: action }));
};

it('autosaves a draft, validates self checks and preserves two versions and reflection', () => {
  const app = mount();
  openFirst('开始实践');
  fireEvent.change(screen.getByLabelText('作业内容'), { target: { value: '尚待完善的访谈思路' } });
  app.unmount();
  mount();
  openFirst('继续完成');
  expect((screen.getByLabelText('作业内容') as HTMLTextAreaElement).value).toBe(
    '尚待完善的访谈思路',
  );
  fireEvent.click(screen.getByRole('button', { name: '提交自评记录' }));
  expect(screen.getByRole('alert').textContent).toContain('至少');
  const body = '先收集员工选课经历，记录原话、行为与场景，再单独标记推断。'.repeat(8);
  fireEvent.change(screen.getByLabelText('作业内容'), { target: { value: body } });
  for (const checkbox of screen.getAllByRole('checkbox')) fireEvent.click(checkbox);
  fireEvent.click(screen.getByRole('button', { name: '提交自评记录' }));
  fireEvent.click(screen.getByRole('button', { name: '确认提交自评' }));
  fireEvent.change(screen.getByLabelText('本版反思'), {
    target: { value: '下一版补充受访对象条件' },
  });
  fireEvent.click(screen.getByRole('button', { name: '基于此版继续改进' }));
  fireEvent.change(screen.getByLabelText('作业内容'), {
    target: { value: body + '增加受访对象条件与邀请方式。' },
  });
  fireEvent.click(screen.getByRole('button', { name: '提交自评记录' }));
  fireEvent.click(screen.getByRole('button', { name: '确认提交自评' }));
  fireEvent.click(screen.getByRole('button', { name: /第 1 版/ }));
  expect(screen.getByText(body).textContent).toBe(body);
  expect((screen.getByLabelText('本版反思') as HTMLTextAreaElement).value).toBe(
    '下一版补充受访对象条件',
  );
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(saved.assignmentSubmissions).toHaveLength(2);
  expect(saved.assignmentDrafts).toHaveLength(0);
});

it('cancelling submission preserves the editable draft', () => {
  mount();
  openFirst('开始实践');
  fireEvent.change(screen.getByLabelText('作业内容'), {
    target: { value: '中立的开放问题和证据记录。'.repeat(20) },
  });
  for (const checkbox of screen.getAllByRole('checkbox')) fireEvent.click(checkbox);
  fireEvent.click(screen.getByRole('button', { name: '提交自评记录' }));
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.queryByLabelText('作业内容')).not.toBeNull();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).assignmentSubmissions).toHaveLength(0);
});
