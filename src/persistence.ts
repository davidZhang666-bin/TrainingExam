import { courses, exams, type LearningState, type Draft, type Attempt } from './domain';
import { gradeExam } from './assessment';
import { parseTask } from './features/planner/validation';
import { parseNote } from './features/notebook/validation';
import { parsePracticeRecord, parseSession } from './features/practice/session';
import { reviewSchedule } from './features/practice/scheduling';
import { parseAssignmentDraft, parseSubmission } from './features/assignments/validation';
import { learningPaths } from './features/paths/catalog';
export const STORAGE_KEY = 'zhixu-learning-v1';
export const RECOVERY_KEY = STORAGE_KEY + '-recovery';
export const localDate = (date = new Date()) =>
  date.getFullYear() +
  '-' +
  String(date.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(date.getDate()).padStart(2, '0');
export function initialState(): LearningState {
  return {
    version: 1,
    profile: {
      name: '林小满',
      department: '产品与体验部',
      role: '产品设计师',
      goal: 120,
      reminder: true,
    },
    enrolled: ['design', 'data', 'security'],
    completed: ['design-1', 'data-1', 'data-2'],
    favorites: [],
    notes: {},
    attempts: [],
    draft: null,
    activity: [18, 28, 0, 42, 24, 36, 20].map((minutes, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return { date: localDate(date), minutes, courseId: i % 2 ? 'data' : 'design' };
    }),
    readNotifications: [],
    studyTasks: [],
    notebook: [],
    practiceHistory: [],
    practiceSession: null,
    reviewSchedule: [],
    assignmentDrafts: [],
    assignmentSubmissions: [],
    pathEnrollments: {},
  };
}
const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const strings = (v: unknown, valid?: string[]) =>
  Array.isArray(v)
    ? [
        ...new Set(
          v.filter(
            (x): x is string =>
              typeof x === 'string' && x.length <= 150 && (!valid || valid.includes(x)),
          ),
        ),
      ].slice(0, 5000)
    : [];
const text = (v: unknown, fallback: string, max = 40) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
function answersFor(examId: string, input: unknown) {
  const exam = exams.find((e) => e.id === examId)!;
  const data = record(input);
  const result: Record<string, number> = {};
  for (const q of exam.questions) {
    const n = data[q.id];
    if (finite(n) && Number.isInteger(n) && n >= 0 && n < q.options.length) result[q.id] = n;
  }
  return result;
}
export function normalizeState(input: unknown): LearningState {
  const raw = record(input);
  if (raw.version !== 1) throw new Error('Unsupported learning data');
  const base = initialState();
  const profile = record(raw.profile);
  const ids = courses.map((c) => c.id);
  const enrolled = Array.isArray(raw.enrolled) ? strings(raw.enrolled, ids) : base.enrolled;
  const completedInput = strings(
    raw.completed,
    courses.flatMap((c) => c.lessons.map((l) => l.id)),
  );
  const completed: string[] = [];
  for (const c of courses.filter((c) => enrolled.includes(c.id))) {
    for (const l of c.lessons) {
      if (!completedInput.includes(l.id)) break;
      completed.push(l.id);
    }
  }
  const attempts: Attempt[] = [];
  const seen = new Set<string>();
  for (const value of Array.isArray(raw.attempts) ? raw.attempts.slice(-5000) : []) {
    const a = record(value);
    const exam = exams.find((e) => e.id === a.examId);
    if (
      !exam ||
      typeof a.id !== 'string' ||
      !a.id ||
      seen.has(a.id) ||
      typeof a.submittedAt !== 'string' ||
      !Number.isFinite(Date.parse(a.submittedAt))
    )
      continue;
    const answers = answersFor(exam.id, a.answers);
    attempts.push({
      id: a.id.slice(0, 150),
      examId: exam.id,
      answers,
      score: gradeExam(exam, answers),
      submittedAt: a.submittedAt,
    });
    seen.add(a.id);
  }
  const notes: Record<string, string> = {};
  const sourceNotes = record(raw.notes);
  for (const l of courses.flatMap((c) => c.lessons))
    if (typeof sourceNotes[l.id] === 'string')
      notes[l.id] = (sourceNotes[l.id] as string).slice(0, 3000);
  const d = record(raw.draft);
  const draftExam = exams.find((e) => e.id === d.examId);
  let draft: Draft | null = null;
  if (draftExam && finite(d.deadline) && d.deadline > 0) {
    const id = draftExam.id + '-' + d.deadline;
    if (!seen.has(id))
      draft = {
        examId: draftExam.id,
        answers: answersFor(draftExam.id, d.answers),
        deadline: d.deadline,
        index: finite(d.index)
          ? Math.max(0, Math.min(draftExam.questions.length - 1, Math.floor(d.index)))
          : 0,
      };
  }
  const activity: LearningState['activity'] = [];
  for (const value of Array.isArray(raw.activity) ? raw.activity.slice(-10000) : []) {
    const a = record(value);
    if (
      typeof a.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
      localDate(new Date(a.date + 'T12:00:00')) === a.date &&
      finite(a.minutes) &&
      a.minutes >= 0 &&
      a.minutes <= 1440 &&
      typeof a.courseId === 'string' &&
      ids.includes(a.courseId)
    )
      activity.push({ date: a.date, minutes: a.minutes, courseId: a.courseId });
  }
  const practiceHistory = uniqueParsed(raw.practiceHistory, parsePracticeRecord, 5000);
  const practiceSession = parseSession(raw.practiceSession);
  return {
    ...base,
    enrolled,
    completed,
    attempts,
    notes,
    draft,
    activity,
    favorites: strings(raw.favorites, ids),
    readNotifications: strings(raw.readNotifications),
    studyTasks: uniqueParsed(raw.studyTasks, parseTask, 5000),
    notebook: uniqueParsed(raw.notebook, parseNote, 2000),
    practiceHistory,
    practiceSession:
      practiceSession && !practiceHistory.some((item) => item.id === practiceSession.id)
        ? practiceSession
        : null,
    reviewSchedule: reviewSchedule(practiceHistory),
    assignmentDrafts: uniqueParsed(raw.assignmentDrafts, parseAssignmentDraft, 100),
    assignmentSubmissions: uniqueParsed(raw.assignmentSubmissions, parseSubmission, 2000),
    pathEnrollments: normalizePathEnrollments(raw.pathEnrollments),
    profile: {
      name: text(profile.name, base.profile.name, 20),
      department: text(profile.department, base.profile.department),
      role: text(profile.role, base.profile.role),
      goal:
        finite(profile.goal) &&
        profile.goal >= 30 &&
        profile.goal <= 1200 &&
        profile.goal % 30 === 0
          ? profile.goal
          : 120,
      reminder: typeof profile.reminder === 'boolean' ? profile.reminder : true,
    },
  };
}

function uniqueParsed<T>(
  value: unknown,
  parse: (item: unknown) => T | null,
  limit: number,
  key: (item: T) => string = (item) => (item as { id: string }).id,
): T[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of value.slice(-limit)) {
    const entry = parse(item);
    const id = entry ? key(entry) : '';
    if (entry && id && !seen.has(id)) {
      seen.add(id);
      result.push(entry);
    }
  }
  return result;
}

function normalizePathEnrollments(value: unknown): LearningState['pathEnrollments'] {
  const input = record(value);
  const valid = new Set(learningPaths.map((path) => path.id));
  return Object.fromEntries(
    Object.entries(input).flatMap(([id, entry]) => {
      const raw = record(entry);
      return valid.has(id) &&
        typeof raw.id === 'string' &&
        raw.id.length <= 150 &&
        typeof raw.startedAt === 'string' &&
        Number.isFinite(Date.parse(raw.startedAt))
        ? [[id, { id: raw.id, startedAt: new Date(raw.startedAt).toISOString() }]]
        : [];
    }),
  );
}
export function loadState(): LearningState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : initialState();
  } catch {
    if (raw) {
      try {
        localStorage.setItem(RECOVERY_KEY, raw);
      } catch {
        /* The current session remains usable when storage is unavailable. */
      }
    }
    return initialState();
  }
}
