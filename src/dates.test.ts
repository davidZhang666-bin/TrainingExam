import { describe, expect, it } from 'vitest';
import { calendarWeek } from './dates';
describe('calendar week targets', () => {
  it('uses Monday through Sunday even on a Sunday', () => {
    const days = calendarWeek(new Date(2026, 9, 25, 12));
    expect(days[0].date).toBe('2026-10-19');
    expect(days[6].date).toBe('2026-10-25');
  });
  it('handles calendar year boundaries', () => {
    const days = calendarWeek(new Date(2026, 0, 1, 12));
    expect(days[0].date).toBe('2025-12-29');
    expect(days[6].date).toBe('2026-01-04');
  });
});
