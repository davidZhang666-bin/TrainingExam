import type { AssignmentSubmission, AssignmentDraft } from './types';
import { assignments } from './catalog';

export function latestSubmission(items: AssignmentSubmission[], assignmentId: string) {
  return items
    .filter((item) => item.assignmentId === assignmentId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
}

export function assignmentStats(drafts: AssignmentDraft[], submissions: AssignmentSubmission[]) {
  const submitted = new Set(submissions.map((item) => item.assignmentId));
  return {
    submitted: submitted.size,
    total: assignments.length,
    drafts: drafts.filter((item) => item.body.trim()).length,
    reflections: submissions.filter((item) => item.reflection.trim()).length,
  };
}
