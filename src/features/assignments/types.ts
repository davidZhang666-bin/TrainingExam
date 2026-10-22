export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  brief: string;
  context: string;
  deliverable: string;
  minutes: number;
  minLength: number;
  rubric: { id: string; label: string; guidance: string }[];
}
export interface AssignmentDraft {
  id: string;
  body: string;
  checks: string[];
  updatedAt: string;
}
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  body: string;
  checks: string[];
  submittedAt: string;
  reflection: string;
}
