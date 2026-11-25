import { describe, it, expect } from 'vitest';
import { rooms, sampleBookings } from '@/lib/data';
import { checkAvailability } from '@/lib/availability';
import { classify, decideRequest } from '@/lib/validation';
import type { Booking } from '@/lib/types';
import type { ReasonCode } from '@/lib/reason_codes';

// Practice #12, Task #05: the eight shared test rows of docs/01_contract.md, executed against the
// code-based track. The same eight rows are entered by hand in the low-code track, and both results
// are transcribed into docs/02_test_table.md. now is pinned to 09:00 = 540 minutes, exactly like the
// Override field in the UI, so a run at 23:00 gives the same verdicts as a run at 08:00.

const NOW = 540;
const TEMPLATE: Booking[] = sampleBookings.map((b) => ({ ...b }));
const fresh = () => TEMPLATE.map((b) => ({ ...b }));
const room = (id: string) => rooms.find((r) => r.id === id);

type Row = { id: string; roomId: string; start: number; end: number; available: boolean; code: ReasonCode };

const ROWS: Row[] = [
  { id: 'T1', roomId: 'r1', start: 780, end: 840, available: true, code: 'OK' },
  { id: 'T2', roomId: 'r1', start: 570, end: 630, available: false, code: 'E_OVERLAP' },
  { id: 'T3', roomId: 'r2', start: 600, end: 660, available: false, code: 'E_BLOCKED' },
  { id: 'T4', roomId: 'r1', start: 840, end: 840, available: false, code: 'E_DURATION_ZERO_OR_NEGATIVE' },
  { id: 'T5', roomId: 'r1', start: 840, end: 961, available: false, code: 'E_DURATION_TOO_LONG' },
  { id: 'T6', roomId: 'r1', start: 480, end: 540, available: false, code: 'E_START_NOT_FUTURE' },
  { id: 'T7', roomId: 'r1', start: 600, end: 660, available: true, code: 'OK' },
];

describe('practice12 shared rows T1-T7', () => {
  for (const row of ROWS) {
    it(`${row.id}: ${row.roomId} ${row.start}-${row.end} -> ${row.available ? 'Available' : 'Unavailable'} ${row.code}`, () => {
      const decided = classify({ start: row.start, end: row.end }, room(row.roomId), fresh(), NOW);
      expect(decided.available).toBe(row.available);
      expect(decided.code).toBe(row.code);

      const legacy = checkAvailability({ start: row.start, end: row.end }, room(row.roomId), fresh(), NOW);
      expect(legacy.available).toBe(row.available);
    });
  }
});

describe('practice12 row T8: booking data unchanged after the whole set', () => {
  it('the seven fixtures are identical after T1-T7 ran', () => {
    for (const row of ROWS) classify({ start: row.start, end: row.end }, room(row.roomId), sampleBookings, NOW);
    expect(sampleBookings).toEqual(TEMPLATE);
    expect(sampleBookings.length).toBe(7);
  });
});

describe('practice12 AC6: invalid input still gets an understandable message', () => {
  it('a non-time string is rejected as E_BAD_FORMAT', () => {
    const d = decideRequest('25:00', '26:00', room('r1'), fresh(), NOW);
    expect(d.code satisfies ReasonCode).toBe('E_BAD_FORMAT');
    expect(d.message).toBe('Please enter valid times in HH:MM format.');
  });

  it('a missing room is refused instead of answering Available', () => {
    const d = classify({ start: 780, end: 840 }, undefined, fresh(), NOW);
    expect(d.available).toBe(false);
    expect(d.code).toBe('E_ROOM_NOT_FOUND');
  });
});
