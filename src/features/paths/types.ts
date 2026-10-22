export interface LearningPath {
  id: string;
  title: string;
  summary: string;
  audience: string;
  outcome: string;
  color: 'purple' | 'mint' | 'peach';
  steps: { courseId: string; objective: string; requireExam: boolean }[];
}
export interface PathEnrollment {
  id: string;
  startedAt: string;
}
