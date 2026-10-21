import { describe, expect, it, vi, afterEach } from 'vitest';
import { courses, exams, courseProgress } from './domain';
import { gradeExam, buildAttempt } from './assessment';
import { initialState, normalizeState, loadState, STORAGE_KEY, RECOVERY_KEY } from './persistence';
import { certificateSvg } from './downloads';

afterEach(()=>vi.unstubAllGlobals());
describe('assessment outcomes',()=>{
  it('awards 100 only for correct answers and scores unanswered questions as zero',()=>{
    const exam=exams[0];const answers=Object.fromEntries(exam.questions.map(q=>[q.id,q.answer]));
    expect(gradeExam(exam,answers)).toBe(100);delete answers[exam.questions[0].id];expect(gradeExam(exam,answers)).toBe(80);expect(gradeExam(exam,{})).toBe(0);
  });
  it('does not award credit to invalid options or unrelated question identifiers',()=>{expect(gradeExam(exams[0],{d1:99,unknown:1})).toBe(0);});
  it('takes an immutable answer snapshot and has a stable session identifier',()=>{const answers={d1:1};const attempt=buildAttempt(exams[0],answers,123);answers.d1=3;expect(attempt.answers.d1).toBe(1);expect(attempt.id).toBe(buildAttempt(exams[0],{},123).id);});
});
describe('persisted learner data recovery',()=>{
  it('preserves a valid round trip and a real calendar date',()=>{const state=initialState();expect(normalizeState(JSON.parse(JSON.stringify(state)))).toEqual(state);});
  it('rejects unsupported versions rather than treating them as valid data',()=>{expect(()=>normalizeState({version:2})).toThrow();});
  it('repairs corrupted collections, names and invalid goals',()=>{const state=normalizeState({...initialState(),profile:{name:' ',goal:-20},favorites:['design','unknown','design'],notes:{'design-1':{},polluted:'text'},activity:[{date:'2026-02-31',minutes:20,courseId:'design'}]});expect(state.profile.name).toBe('林小满');expect(state.profile.goal).toBe(120);expect(state.favorites).toEqual(['design']);expect(state.notes).toEqual({});expect(state.activity).toEqual([]);});
  it('drops incomplete chapter sequences and deduplicates progress',()=>{const state=normalizeState({...initialState(),completed:['design-1','design-1','design-3']});expect(state.completed).toEqual(['design-1']);expect(courseProgress(courses[0],state.completed)).toBe(25);});
  it('recomputes a persisted grade and validates draft indexes and answers',()=>{const state=normalizeState({...initialState(),attempts:[{id:'attempt',examId:exams[0].id,answers:{d1:1,d2:50},score:100,submittedAt:'2026-10-21T01:00:00Z'}],draft:{examId:exams[0].id,deadline:100,index:999,answers:{d1:-1,d2:2}}});expect(state.attempts[0].score).toBe(20);expect(state.draft?.index).toBe(4);expect(state.draft?.answers).toEqual({d2:2});});
  it('discards a draft already submitted in the same session',()=>{const attempt=buildAttempt(exams[0],{},123);const state=normalizeState({...initialState(),attempts:[attempt],draft:{examId:exams[0].id,deadline:123,index:0,answers:{}}});expect(state.draft).toBeNull();});
  it('backs up unreadable source data before falling back',()=>{const saved=new Map([[STORAGE_KEY,'{broken']]);vi.stubGlobal('localStorage',{getItem:(k:string)=>saved.get(k),setItem:(k:string,v:string)=>saved.set(k,v)});expect(loadState().version).toBe(1);expect(saved.get(RECOVERY_KEY)).toBe('{broken');});
  it('continues without crashing when browser storage is denied',()=>{vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('denied');}});expect(loadState().profile.name).toBe('林小满');});
});
describe('downloaded certificate safety',()=>{
  it('escapes learner input as text in SVG',()=>{const svg=certificateSvg('<script>alert(1)</script>','A & B','2026','id');expect(svg).not.toContain('<script>');expect(svg).toContain('&lt;script&gt;');expect(svg).toContain('A &amp; B');});
});
