// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LearningProvider, initialState, STORAGE_KEY } from '../store';
import { createBackup } from '../backup';
import DataBackup from './DataBackup';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('previews new module counts and applies a backup only after confirmation', async () => {
  const data = initialState();
  data.profile.name = '备份学员';
  data.pathEnrollments.onboarding = { id: 'path-demo', startedAt: new Date().toISOString() };
  const onRestore = vi.fn();
  render(
    <LearningProvider>
      <DataBackup onRestore={onRestore} />
    </LearningProvider>,
  );
  const file = { size: 1000, text: async () => createBackup(data) };
  fireEvent.change(screen.getByLabelText('选择学习备份文件'), { target: { files: [file] } });
  expect(await screen.findByRole('dialog')).not.toBeNull();
  expect(screen.getByText(/0 项计划/).textContent).toContain('1 条学习路径');
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).profile.name).not.toBe('备份学员');
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  expect(onRestore).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('选择学习备份文件'), { target: { files: [file] } });
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: '确认恢复备份' }));
  expect(onRestore).toHaveBeenCalledOnce();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).profile.name).toBe('备份学员');
});

it('rejects unreadable files without replacing local records', async () => {
  render(
    <LearningProvider>
      <DataBackup onRestore={vi.fn()} />
    </LearningProvider>,
  );
  const original = localStorage.getItem(STORAGE_KEY);
  fireEvent.change(screen.getByLabelText('选择学习备份文件'), {
    target: { files: [{ size: 10, text: async () => '{broken' }] },
  });
  expect((await screen.findByRole('alert')).textContent).toContain('不是有效的 JSON');
  expect(localStorage.getItem(STORAGE_KEY)).toBe(original);
  expect(screen.queryByRole('dialog')).toBeNull();
});
