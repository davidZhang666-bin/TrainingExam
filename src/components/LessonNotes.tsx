import { NotebookPen, Save } from 'lucide-react';
import { useLearning } from '../store';
export default function LessonNotes({ lessonId }: { lessonId: string }) {
  const { state, saveNote, storageError } = useLearning(); const text = state.notes[lessonId] ?? '';
  return <section className="lesson-notes"><div><h3><NotebookPen size={15}/>我的学习笔记</h3><span>{storageError ? '暂未保存到浏览器' : <><Save size={12}/>自动保存到本机</>}</span></div><label className="visually-hidden" htmlFor="lesson-note">本章学习笔记</label><textarea id="lesson-note" placeholder="记下一点启发，或一个想要实践的想法…" value={text} maxLength={3000} onChange={e=>saveNote(lessonId,e.target.value)}/><small>{text.length} / 3000</small></section>;
}
