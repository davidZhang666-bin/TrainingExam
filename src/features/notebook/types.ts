export interface NotebookNote {
  id: string;
  title: string;
  body: string;
  courseId: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
export type NoteInput = Pick<NotebookNote, 'title' | 'body' | 'courseId' | 'tags'>;
export type NoteSort = 'recent' | 'oldest' | 'title';
export interface NoteFilter {
  query: string;
  tag: string;
  courseId: string;
  archived: boolean;
  sort: NoteSort;
}
