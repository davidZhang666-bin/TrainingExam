// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { LearningProvider, STORAGE_KEY, initialState } from '../../store';
import Notebook from '../../pages/Notebook';

beforeEach(() => localStorage.clear());
afterEach(cleanup);
const mount = () =>
  render(
    <LearningProvider>
      <Notebook />
    </LearningProvider>,
  );

it('saves tags without submitting the form and supports search, editing and archive recovery', () => {
  const app = mount();
  fireEvent.click(screen.getByRole('button', { name: '新建笔记' }));
  fireEvent.change(screen.getByLabelText('笔记标题'), { target: { value: '访谈观察' } });
  fireEvent.change(screen.getByLabelText('笔记正文'), {
    target: { value: '应先记录原话，再单独标注推断。' },
  });
  const tags = screen.getByLabelText('标签（最多 8 个）');
  fireEvent.change(tags, { target: { value: '研究,证据' } });
  fireEvent.keyDown(tags, { key: 'Enter' });
  expect(screen.queryByRole('dialog')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '保存笔记' }));
  fireEvent.change(screen.getByLabelText('搜索笔记'), { target: { value: '找不到' } });
  expect(screen.queryByText('访谈观察')).toBeNull();
  fireEvent.change(screen.getByLabelText('搜索笔记'), { target: { value: '原话' } });
  expect(screen.queryByText('访谈观察')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '访谈观察' }));
  fireEvent.change(screen.getByLabelText('笔记标题'), { target: { value: '访谈证据' } });
  fireEvent.click(screen.getByRole('button', { name: '保存笔记' }));
  fireEvent.click(screen.getByRole('button', { name: '归档访谈证据', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '归档笔记', exact: true }));
  expect(screen.queryByText('访谈证据')).not.toBeNull();
  app.unmount();
  mount();
  fireEvent.click(screen.getByRole('button', { name: '归档笔记', exact: true }));
  expect(screen.getAllByText('#研究').length).toBeGreaterThan(0);
});

it('collects chapter notes once while retaining their originals', () => {
  const state = initialState();
  state.notes['design-1'] = '章节中的观察记录';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  mount();
  fireEvent.click(screen.getByRole('button', { name: '收集章节笔记' }));
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: '收集 1 条笔记' }));
  expect(screen.queryByText('章节中的观察记录')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '收集章节笔记' }));
  expect(screen.queryByText('暂时没有可收集的新笔记')).not.toBeNull();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).notes['design-1']).toBe('章节中的观察记录');
});
