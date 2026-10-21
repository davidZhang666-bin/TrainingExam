import { useEffect } from 'react';
import { useLearning } from './store';
import { exams } from './domain';
import { buildAttempt } from './assessment';

// The answer screen submits its own result so it can present the review immediately.
// This watcher covers all other routes and expired sessions restored on startup.
export function useExamDeadline(background: boolean) {
  const { state, addAttempt } = useLearning();
  useEffect(() => {
    if (!background || !state.draft) return;
    const draft = state.draft;
    const exam = exams.find((e) => e.id === draft.examId);
    if (!exam) return;
    const expire = () => {
      if (Date.now() >= draft.deadline)
        addAttempt(buildAttempt(exam, draft.answers, draft.deadline));
    };
    expire();
    const timer = window.setInterval(expire, 500);
    window.addEventListener('focus', expire);
    document.addEventListener('visibilitychange', expire);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', expire);
      document.removeEventListener('visibilitychange', expire);
    };
  }, [background, state.draft, addAttempt]);
}
