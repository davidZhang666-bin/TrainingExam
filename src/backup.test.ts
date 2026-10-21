import { describe, it, expect } from 'vitest';
import { createBackup, parseBackup, csvCell, reportCsv } from './backup';
import { initialState } from './persistence';
describe('portable learning records',()=>{
  it('restores progress and notes from an exported backup',()=>{const state=initialState();state.notes['design-1']='一条真实笔记';expect(parseBackup(createBackup(state))).toEqual(state);});
  it('rejects unrelated, malformed and incomplete files',()=>{for(const text of ['{',JSON.stringify({version:1}),JSON.stringify({app:'zhixu-academy',version:1,data:{version:1}})])expect(()=>parseBackup(text)).toThrow();});
  it('rejects excessive input before parsing',()=>{expect(()=>parseBackup(' '.repeat(2_000_001))).toThrow('过大');});
  it('escapes spreadsheet formula prefixes and quotes',()=>{expect(csvCell('=1+1')).toBe('"\'=1+1"');expect(csvCell('A"B')).toBe('"A""B"');expect(reportCsv(initialState())).toContain('完成进度(%)');});
});
