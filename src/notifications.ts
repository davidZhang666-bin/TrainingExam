import { courses, exams, courseProgress, type LearningState, type Page } from './domain';
export interface LearningNotification {
  id: string;
  title: string;
  text: string;
  page: Page;
  kind: 'welcome' | 'study' | 'certificate';
}
export function getNotifications(state: LearningState): LearningNotification[] {
  const items: LearningNotification[] = [
    {
      id: 'welcome',
      title: '你好，欢迎来到知序',
      text: '你的学习空间已准备就绪，从一份好奇开始吧。',
      page: 'catalog',
      kind: 'welcome',
    },
  ];
  if (state.profile.reminder) {
    const next = courses.find(
      (c) => state.enrolled.includes(c.id) && courseProgress(c, state.completed) < 100,
    );
    if (next)
      items.unshift({
        id: 'continue-' + next.id,
        title: '给成长留一点时间',
        text: '「' + next.title + '」还有新的章节，等你继续探索。',
        page: 'learning',
        kind: 'study',
      });
  }
  for (const exam of exams)
    if (state.attempts.some((a) => a.examId === exam.id && a.score >= exam.pass))
      items.unshift({
        id: 'certificate-' + exam.id,
        title: '一份成长证书，已为你准备好',
        text: '恭喜通过「' + exam.title + '」，去珍藏这份收获吧。',
        page: 'certificates',
        kind: 'certificate',
      });
  return items;
}
