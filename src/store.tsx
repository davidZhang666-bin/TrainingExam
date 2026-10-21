import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { courses, type LearningState, type Profile, type Draft, type Attempt } from './domain';

import { initialState, loadState, localDate, STORAGE_KEY, normalizeState } from './persistence';
export { initialState, loadState, localDate, STORAGE_KEY } from './persistence';
type Store = {
  state: LearningState; storageError: boolean;
  enroll: (id: string) => void; toggleFavorite: (id: string) => void;
  completeLesson: (id: string) => void; saveNote: (id: string, text: string) => void;
  updateProfile: (profile: Profile) => void; saveDraft: (draft: Draft | null) => void;
  addAttempt: (attempt: Attempt) => void; readNotifications: (ids: string[]) => void; reset: () => void; restore: (data: LearningState) => void;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(false); } catch { setStorageError(true); } }, [state]);
  const value: Store = {
    state, storageError,
    enroll: id => setState(s => ({ ...s, enrolled: [...new Set([...s.enrolled, id])] })),
    toggleFavorite: id => setState(s => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter(c => c !== id) : [...s.favorites, id] })),
    completeLesson: id => setState(s => {
      if (s.completed.includes(id)) return s;
      const course = courses.find(c => c.lessons.some(l => l.id === id)); const lesson = course?.lessons.find(l => l.id === id);
      if (!course || !lesson || !s.enrolled.includes(course.id)) return s;
      const index = course.lessons.findIndex(l => l.id === id);
      if (course.lessons.slice(0, index).some(l => !s.completed.includes(l.id))) return s;
      return { ...s, completed: [...s.completed, id], activity: [...s.activity, { date: localDate(), courseId: course.id, minutes: lesson.minutes }] };
    }),
    saveNote: (id, text) => setState(s => ({ ...s, notes: { ...s.notes, [id]: text } })),
    updateProfile: profile => setState(s => ({ ...s, profile })),
    saveDraft: draft => setState(s => ({ ...s, draft })),
    addAttempt: attempt => setState(s => s.attempts.some(a => a.id === attempt.id) ? s : ({ ...s, attempts: [...s.attempts, attempt], draft: null })),
    readNotifications: ids => setState(s => ({ ...s, readNotifications: [...new Set([...s.readNotifications, ...ids])] })),
    reset: () => setState(initialState()),
    restore: data => setState(normalizeState(data)),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLearning() { const store = useContext(Context); if (!store) throw new Error('LearningProvider missing'); return store; }
