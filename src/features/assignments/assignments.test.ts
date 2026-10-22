import { describe, expect, it } from 'vitest';
import { assignments } from './catalog';
import { submissionErrors, parseSubmission } from './validation';
import { assignmentStats } from './selectors';

describe('practice assignment snapshots', () => {
  const assignment = assignments[0];
  const body = '访谈计划'.repeat(40);
  const checks = assignment.rubric.map((item) => item.id);
  const submission = {
    id: 'snapshot',
    assignmentId: assignment.id,
    body,
    checks,
    submittedAt: '2026-10-22T00:00:00.000Z',
    reflection: '下次补充真实观察',
  };
  it('requires both substantive content and the complete self-check before submission', () => {
    expect(submissionErrors(assignment, body, checks)).toEqual([]);
    expect(submissionErrors(assignment, '', checks)).not.toEqual([]);
    expect(submissionErrors(assignment, body, checks.slice(1))).not.toEqual([]);
  });
  it('rejects incomplete imported snapshots and keeps valid reflections', () => {
    expect(parseSubmission(submission)).toEqual(submission);
    expect(parseSubmission({ ...submission, checks: [] })).toBeNull();
    expect(parseSubmission({ ...submission, assignmentId: 'missing' })).toBeNull();
    expect(parseSubmission({ ...submission, submittedAt: 'broken' })).toBeNull();
  });
  it('counts unique completed assignments separately from submission versions', () => {
    const stats = assignmentStats([], [submission, { ...submission, id: 'revision' }]);
    expect(stats.submitted).toBe(1);
    expect(stats.reflections).toBe(2);
  });
});
