import { assignments } from './catalog';
import type { Assignment, AssignmentDraft, AssignmentSubmission } from './types';
import { record, text, timestamp } from '../../workspace/validation';

export function submissionErrors(assignment: Assignment, body: string, checks: string[]): string[] {
  const errors = [];
  if (body.trim().length < assignment.minLength)
    errors.push(`内容至少需要 ${assignment.minLength} 字。`);
  if (body.length > 12000) errors.push('内容不能超过 12000 字。');
  if (assignment.rubric.some((item) => !checks.includes(item.id)))
    errors.push('请逐项完成提交前自查。');
  return errors;
}

export function parseAssignmentDraft(value: unknown): AssignmentDraft | null {
  const raw = record(value);
  const assignment = assignments.find((item) => item.id === raw.id);
  const updatedAt = timestamp(raw.updatedAt);
  if (!assignment || !updatedAt) return null;
  const checks = Array.isArray(raw.checks)
    ? assignment.rubric
        .filter((item) => raw.checks instanceof Array && raw.checks.includes(item.id))
        .map((item) => item.id)
    : [];
  return {
    id: assignment.id,
    body: typeof raw.body === 'string' ? raw.body.slice(0, 12000) : '',
    checks,
    updatedAt,
  };
}

export function parseSubmission(value: unknown): AssignmentSubmission | null {
  const raw = record(value);
  const assignment = assignments.find((item) => item.id === raw.assignmentId);
  const draft = parseAssignmentDraft({ ...raw, id: raw.assignmentId, updatedAt: raw.submittedAt });
  if (
    !text(raw.id) ||
    !assignment ||
    !draft ||
    submissionErrors(assignment, draft.body, draft.checks).length
  )
    return null;
  return {
    id: text(raw.id),
    assignmentId: assignment.id,
    body: draft.body,
    checks: draft.checks,
    submittedAt: draft.updatedAt,
    reflection: text(raw.reflection, 2000),
  };
}
