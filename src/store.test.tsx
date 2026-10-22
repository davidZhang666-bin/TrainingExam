// @vitest-environment jsdom
import { StrictMode, type ReactNode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LearningProvider, useLearning, STORAGE_KEY } from './store';
import { createBackup, parseBackup } from './backup';
import { normalizeState, initialState } from './persistence';
import { practiceBank } from './features/practice/bank';
import { gradePractice } from './features/practice/grading';
import { assignments } from './features/assignments/catalog';
import type { TaskInput } from './features/planner/types';

const wrapper = ({ children }: { children: ReactNode }) => (
  <StrictMode>
    <LearningProvider>{children}</LearningProvider>
  </StrictMode>
);
beforeEach(() => localStorage.clear());
afterEach(cleanup);
const task: TaskInput = {
  title: '阅读章节',
  date: '2026-10-22',
  time: '18:00',
  minutes: 30,
  courseId: 'design',
  kind: 'course',
  description: '',
};

describe('workspace commands and persistence', () => {
  it('returns saved objects immediately and runs commands once under StrictMode', () => {
    const { result } = renderHook(useLearning, { wrapper });
    act(() => {
      const saved = result.current.addStudyTask(task);
      expect(saved.errors).toEqual([]);
      expect(saved.task?.id).toBeTruthy();
      expect(
        result.current.updateStudyTask(saved.task!.id, { ...task, title: '更新计划' }).task?.title,
      ).toBe('更新计划');
      expect(result.current.addStudyTask(task).errors.join()).toContain('重叠');
    });
    expect(result.current.state.studyTasks).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).studyTasks[0].title).toBe('更新计划');
  });

  it('restores a paused multi-answer session and finishes it only once', () => {
    const question = practiceBank.find((item) => item.kind === 'multiple')!;
    const first = renderHook(useLearning, { wrapper });
    act(() => {
      first.result.current.beginPractice([question.id]);
      first.result.current.answerPractice(question.id, [...question.correct]);
      first.result.current.beginPractice([practiceBank[0].id]);
    });
    const id = first.result.current.state.practiceSession!.id;
    first.unmount();
    const next = renderHook(useLearning, { wrapper });
    expect(next.result.current.state.practiceSession?.id).toBe(id);
    act(() => {
      const record = next.result.current.finishPracticeSession();
      expect(record && gradePractice(record).score).toBe(100);
      expect(next.result.current.finishPracticeSession()).toBeNull();
    });
    expect(next.result.current.state.practiceHistory).toHaveLength(1);
    expect(next.result.current.state.reviewSchedule[0].attempts).toBe(1);
  });

  it('keeps submission versions independent of later draft and reflection edits', () => {
    const { result } = renderHook(useLearning, { wrapper });
    const assignment = assignments[0];
    const checks = assignment.rubric.map((item) => item.id);
    const submission = {
      id: 'version-1',
      assignmentId: assignment.id,
      body: '研究内容'.repeat(40),
      checks,
      submittedAt: new Date().toISOString(),
      reflection: '',
    };
    act(() => {
      result.current.submitAssignment({ ...submission, body: '太短' });
      result.current.submitAssignment(submission);
      checks.pop();
      result.current.submitAssignment({ ...submission, body: '替换内容'.repeat(40) });
      result.current.saveAssignmentDraft({
        id: assignment.id,
        body: '下一版草稿\n',
        checks: [],
        updatedAt: new Date().toISOString(),
      });
      result.current.saveAssignmentReflection('version-1', '下次增加证据');
    });
    expect(result.current.state.assignmentSubmissions).toHaveLength(1);
    expect(result.current.state.assignmentSubmissions[0].checks).toHaveLength(
      assignment.rubric.length,
    );
    expect(result.current.state.assignmentSubmissions[0].body).toBe(submission.body);
    expect(result.current.state.assignmentDrafts[0].body).toBe('下一版草稿\n');
    expect(result.current.state.assignmentSubmissions[0].reflection).toBe('下次增加证据');
  });

  it('round trips every workspace collection and repairs a stale practice draft', () => {
    const { result } = renderHook(useLearning, { wrapper });
    act(() => {
      result.current.addStudyTask(task);
      result.current.addNotebookNote({
        title: '观察',
        body: '区分事实与假设',
        tags: ['研究'],
        courseId: 'design',
      });
      result.current.beginPractice([practiceBank[0].id]);
      result.current.answerPractice(practiceBank[0].id, practiceBank[0].correct);
      result.current.finishPracticeSession();
      result.current.saveAssignmentDraft({
        id: assignments[0].id,
        body: '仍在思考',
        checks: [],
        updatedAt: new Date().toISOString(),
      });
      result.current.enrollPath('onboarding');
    });
    const restored = parseBackup(createBackup(result.current.state));
    expect(restored).toEqual(result.current.state);
    const record = restored.practiceHistory[0];
    const repaired = normalizeState({
      ...restored,
      practiceSession: { ...record, index: 0 },
      reviewSchedule: [{ questionId: 'fake', due: '2099-01-01' }],
    });
    expect(repaired.practiceSession).toBeNull();
    expect(repaired.reviewSchedule).toEqual(restored.reviewSchedule);
  });

  it('accepts old v1 backups without workspace fields and resets all new records', () => {
    const legacy = { ...initialState() } as Record<string, unknown>;
    for (const field of [
      'studyTasks',
      'notebook',
      'practiceHistory',
      'practiceSession',
      'reviewSchedule',
      'assignmentDrafts',
      'assignmentSubmissions',
      'pathEnrollments',
    ])
      delete legacy[field];
    const { result } = renderHook(useLearning, { wrapper });
    act(() => {
      result.current.addStudyTask(task);
      result.current.enrollPath('onboarding');
      result.current.restore(normalizeState(legacy));
    });
    expect(result.current.state.studyTasks).toEqual([]);
    expect(result.current.state.pathEnrollments).toEqual({});
    act(() => {
      result.current.addStudyTask(task);
      result.current.reset();
    });
    expect(result.current.state.studyTasks).toEqual([]);
  });
});
