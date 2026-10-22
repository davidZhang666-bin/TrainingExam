import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { courses, type LearningState, type Profile, type Draft, type Attempt } from './domain';
import type { StudyTask, TaskInput } from './features/planner/types';
import type { NotebookNote, NoteInput } from './features/notebook/types';
import type { PracticeRecord, PracticeSession, ReviewItem } from './features/practice/types';
import type { AssignmentDraft, AssignmentSubmission } from './features/assignments/types';
import type { PathEnrollment } from './features/paths/types';
import { validateTask } from './features/planner/validation';
import { conflictsFor } from './features/planner/selectors';
import { validateNote } from './features/notebook/validation';
import { answerQuestion, startPractice } from './features/practice/session';
import { reviewSchedule } from './features/practice/scheduling';
import { finishPractice } from './features/practice/grading';
import { questionById } from './features/practice/bank';
import { newId, tags as normalizeTags } from './workspace/validation';
import { parseAssignmentDraft, parseSubmission } from './features/assignments/validation';
import { learningPaths } from './features/paths/catalog';

import { initialState, loadState, localDate, STORAGE_KEY, normalizeState } from './persistence';
export { initialState, loadState, localDate, STORAGE_KEY } from './persistence';
type Store = {
  state: LearningState;
  storageError: boolean;
  enroll: (id: string) => void;
  toggleFavorite: (id: string) => void;
  completeLesson: (id: string) => void;
  saveNote: (id: string, text: string) => void;
  updateProfile: (profile: Profile) => void;
  saveDraft: (draft: Draft | null) => void;
  addAttempt: (attempt: Attempt) => void;
  readNotifications: (ids: string[]) => void;
  reset: () => void;
  restore: (data: LearningState) => void;
  addStudyTask: (input: TaskInput) => { task?: StudyTask; errors: string[] };
  updateStudyTask: (id: string, input: TaskInput) => { task?: StudyTask; errors: string[] };
  removeStudyTask: (id: string) => void;
  toggleStudyTask: (id: string) => void;
  addNotebookNote: (input: NoteInput) => { note?: NotebookNote; errors: string[] };
  updateNotebookNote: (id: string, input: NoteInput) => { note?: NotebookNote; errors: string[] };
  deleteNotebookNote: (id: string) => void;
  toggleNotebookPin: (id: string) => void;
  toggleNotebookArchive: (id: string) => void;
  beginPractice: (ids: string[], mode?: PracticeSession['mode']) => void;
  answerPractice: (id: string, answer: number[]) => void;
  movePractice: (index: number) => void;
  finishPracticeSession: () => PracticeRecord | null;
  clearPracticeSession: () => void;
  startPracticeReview: (items: ReviewItem[]) => void;
  saveAssignmentDraft: (draft: AssignmentDraft) => void;
  submitAssignment: (submission: AssignmentSubmission) => void;
  saveAssignmentReflection: (id: string, reflection: string) => void;
  enrollPath: (id: string) => void;
  unenrollPath: (id: string) => void;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, publishState] = useState(loadState);
  const current = useRef(state);
  // Run commands once, outside React's retryable state updater callbacks.
  const setState = (update: LearningState | ((previous: LearningState) => LearningState)) => {
    const next = typeof update === 'function' ? update(current.current) : update;
    current.current = next;
    publishState(next);
  };
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  const value: Store = {
    state,
    storageError,
    enroll: (id) => setState((s) => ({ ...s, enrolled: [...new Set([...s.enrolled, id])] })),
    toggleFavorite: (id) =>
      setState((s) => ({
        ...s,
        favorites: s.favorites.includes(id)
          ? s.favorites.filter((c) => c !== id)
          : [...s.favorites, id],
      })),
    completeLesson: (id) =>
      setState((s) => {
        if (s.completed.includes(id)) return s;
        const course = courses.find((c) => c.lessons.some((l) => l.id === id));
        const lesson = course?.lessons.find((l) => l.id === id);
        if (!course || !lesson || !s.enrolled.includes(course.id)) return s;
        const index = course.lessons.findIndex((l) => l.id === id);
        if (course.lessons.slice(0, index).some((l) => !s.completed.includes(l.id))) return s;
        return {
          ...s,
          completed: [...s.completed, id],
          activity: [
            ...s.activity,
            { date: localDate(), courseId: course.id, minutes: lesson.minutes },
          ],
        };
      }),
    saveNote: (id, text) => setState((s) => ({ ...s, notes: { ...s.notes, [id]: text } })),
    updateProfile: (profile) => setState((s) => ({ ...s, profile })),
    saveDraft: (draft) => setState((s) => ({ ...s, draft })),
    addAttempt: (attempt) =>
      setState((s) =>
        s.attempts.some((a) => a.id === attempt.id)
          ? s
          : { ...s, attempts: [...s.attempts, attempt], draft: null },
      ),
    readNotifications: (ids) =>
      setState((s) => ({
        ...s,
        readNotifications: [...new Set([...s.readNotifications, ...ids])],
      })),
    reset: () => setState(initialState()),
    restore: (data) => setState(normalizeState(data)),
    addStudyTask: (input) => {
      const errors = validateTask(input);
      if (conflictsFor(input, current.current.studyTasks).length)
        errors.push('计划时间与现有安排重叠。');
      if (errors.length) return { errors };
      const task: StudyTask = {
        ...input,
        title: input.title.trim(),
        id: newId('task'),
        status: 'planned',
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, studyTasks: [...s.studyTasks, task] }));
      return { task, errors };
    },
    updateStudyTask: (id, input) => {
      const errors = validateTask(input);
      if (conflictsFor(input, current.current.studyTasks, id).length)
        errors.push('计划时间与现有安排重叠。');
      if (errors.length) return { errors };
      let task: StudyTask | undefined;
      setState((s) => ({
        ...s,
        studyTasks: s.studyTasks.map((item) => {
          if (item.id !== id) return item;
          task = { ...item, ...input, title: input.title.trim() };
          return task;
        }),
      }));
      return task ? { task, errors } : { errors: ['找不到要修改的计划。'] };
    },
    removeStudyTask: (id) =>
      setState((s) => ({ ...s, studyTasks: s.studyTasks.filter((item) => item.id !== id) })),
    toggleStudyTask: (id) =>
      setState((s) => ({
        ...s,
        studyTasks: s.studyTasks.map((item) =>
          item.id === id
            ? {
                ...item,
                status: item.status === 'done' ? 'planned' : 'done',
                completedAt: item.status === 'done' ? null : new Date().toISOString(),
              }
            : item,
        ),
      })),
    addNotebookNote: (input) => {
      const errors = validateNote(input);
      if (errors.length) return { errors };
      const now = new Date().toISOString();
      const note: NotebookNote = {
        ...input,
        title: input.title.trim(),
        body: input.body.trim(),
        tags: normalizeTags(input.tags),
        id: newId('note'),
        pinned: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      setState((s) => ({ ...s, notebook: [note, ...s.notebook] }));
      return { note, errors };
    },
    updateNotebookNote: (id, input) => {
      const errors = validateNote(input);
      if (errors.length) return { errors };
      let note: NotebookNote | undefined;
      setState((s) => ({
        ...s,
        notebook: s.notebook.map((item) => {
          if (item.id !== id) return item;
          note = {
            ...item,
            ...input,
            title: input.title.trim(),
            body: input.body.trim(),
            tags: normalizeTags(input.tags),
            updatedAt: new Date().toISOString(),
          };
          return note;
        }),
      }));
      return note ? { note, errors } : { errors: ['找不到这条笔记。'] };
    },
    deleteNotebookNote: (id) =>
      setState((s) => ({ ...s, notebook: s.notebook.filter((item) => item.id !== id) })),
    toggleNotebookPin: (id) =>
      setState((s) => ({
        ...s,
        notebook: s.notebook.map((item) =>
          item.id === id ? { ...item, pinned: !item.pinned } : item,
        ),
      })),
    toggleNotebookArchive: (id) =>
      setState((s) => ({
        ...s,
        notebook: s.notebook.map((item) =>
          item.id === id ? { ...item, archived: !item.archived } : item,
        ),
      })),
    beginPractice: (ids, mode = 'practice') => {
      try {
        setState((s) =>
          s.practiceSession ? s : { ...s, practiceSession: startPractice(ids, mode) },
        );
      } catch {
        /* Keep the current workspace intact when no question matches. */
      }
    },
    answerPractice: (id, answer) =>
      setState((s) =>
        s.practiceSession
          ? { ...s, practiceSession: answerQuestion(s.practiceSession, id, answer) }
          : s,
      ),
    movePractice: (index) =>
      setState((s) =>
        s.practiceSession
          ? {
              ...s,
              practiceSession: {
                ...s.practiceSession,
                index: Math.max(0, Math.min(s.practiceSession.questionIds.length - 1, index)),
              },
            }
          : s,
      ),
    finishPracticeSession: () => {
      let finished: PracticeRecord | null = null;
      setState((s) => {
        if (!s.practiceSession) return s;
        const session = s.practiceSession;
        finished = finishPractice(session);
        if (s.practiceHistory.some((item) => item.id === finished!.id))
          return { ...s, practiceSession: null };
        const practiceHistory = [...s.practiceHistory, finished!].slice(-5000);
        return {
          ...s,
          practiceSession: null,
          practiceHistory,
          reviewSchedule: reviewSchedule(practiceHistory),
        };
      });
      return finished;
    },
    clearPracticeSession: () => setState((s) => ({ ...s, practiceSession: null })),
    startPracticeReview: (items) => {
      const ids = items.map((item) => item.questionId).filter((id) => questionById.has(id));
      if (ids.length)
        setState((s) =>
          s.practiceSession ? s : { ...s, practiceSession: startPractice(ids, 'review') },
        );
    },
    saveAssignmentDraft: (draft) => {
      const parsed = parseAssignmentDraft(draft);
      if (parsed)
        setState((s) => ({
          ...s,
          assignmentDrafts: [...s.assignmentDrafts.filter((item) => item.id !== parsed.id), parsed],
        }));
    },
    submitAssignment: (submission) => {
      const parsed = parseSubmission(submission);
      if (!parsed) return;
      setState((s) =>
        s.assignmentSubmissions.some((item) => item.id === parsed.id)
          ? s
          : {
              ...s,
              assignmentDrafts: s.assignmentDrafts.filter(
                (item) => item.id !== parsed.assignmentId,
              ),
              assignmentSubmissions: [...s.assignmentSubmissions, parsed],
            },
      );
    },
    saveAssignmentReflection: (id, reflection) =>
      setState((s) => ({
        ...s,
        assignmentSubmissions: s.assignmentSubmissions.map((item) =>
          item.id === id ? { ...item, reflection: reflection.slice(0, 2000) } : item,
        ),
      })),
    enrollPath: (id) =>
      setState((s) =>
        s.pathEnrollments[id] || !learningPaths.some((path) => path.id === id)
          ? s
          : {
              ...s,
              pathEnrollments: {
                ...s.pathEnrollments,
                [id]: { id: newId('path'), startedAt: new Date().toISOString() } as PathEnrollment,
              },
            },
      ),
    unenrollPath: (id) =>
      setState((s) => {
        const pathEnrollments = { ...s.pathEnrollments };
        delete pathEnrollments[id];
        return { ...s, pathEnrollments };
      }),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLearning() {
  const store = useContext(Context);
  if (!store) throw new Error('LearningProvider missing');
  return store;
}
