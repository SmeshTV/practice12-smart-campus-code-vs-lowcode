import { describe, it, expect } from 'vitest';
import { checkAvailability, isValidInterval, parseTimeToMinutes } from '@/lib/availability';
import { rooms, sampleBookings } from '@/lib/data';
import type { Booking, Interval } from '@/lib/types';
import { MINUTES_PER_DAY } from '@/lib/types';

// Practice #09, Step #06. Seven focused regression tests, one per behavior the refactoring
// touches, each naming the acceptance criterion it protects. They are added next to the 23
// baseline tests in booking.test.ts, which are left untouched.
// Fixture facts these rely on (src/lib/data.ts): r1 is unblocked and holds b1 540-600 and
// b2 720-780; r2 is blocked; the fixed clock is 09:00 = 540.

const now = 540;

const snapshot = (bookings: Booking[]) => bookings.map((b) => ({ ...b }));
const freshBookings = () => snapshot(sampleBookings);

function room(id: string) {
  return rooms.find((r) => r.id === id);
}

describe('regression after extracting isValidInterval', () => {
  it('R1 AC1: a start time in the past is rejected', () => {
    const candidate: Interval = { start: 480, end: 540 };
    // 480 is 08:00 and the clock is 09:00, so the request is entirely in the past.
    const res = checkAvailability(candidate, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain('Start time must be after the current time.');
  });

  it('R2 AC1: a reversed interval is rejected', () => {
    const candidate: Interval = { start: 700, end: 600 };
    // start >= end cannot describe a booking, whatever the clock says.
    const res = checkAvailability(candidate, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('0 ≤ start < end ≤ 1440'))).toBe(true);
    // Added after mutation M1: an interval whose endpoints are equal is the boundary case of the
    // same rule, and breaking only that half of the predicate has to be visible here too.
    const degenerate: Interval = { start: 600, end: 600 };
    const second = checkAvailability(degenerate, room('r1'), freshBookings(), now);
    expect(second.available).toBe(false);
    expect(second.reasons.some((r) => r.includes('0 ≤ start < end ≤ 1440'))).toBe(true);
  });

  it('R3 AC2: a 121 minute duration is rejected but exactly 120 is accepted', () => {
    const tooLong: Interval = { start: 600, end: 721 };
    const exactlyMax: Interval = { start: 600, end: 720 };
    expect(tooLong.end - tooLong.start).toBe(121);
    expect(exactlyMax.end - exactlyMax.start).toBe(MINUTES_PER_DAY / 12);
    const rejected = checkAvailability(tooLong, room('r1'), freshBookings(), now);
    const accepted = checkAvailability(exactlyMax, room('r1'), freshBookings(), now);
    expect(rejected.available).toBe(false);
    expect(rejected.reasons.some((r) => r.includes('longer than 120 minutes'))).toBe(true);
    expect(accepted.available).toBe(true);
  });

  it('R4 AC3: a blocked room is never available', () => {
    const candidate: Interval = { start: 600, end: 660 };
    // r2 has no bookings at all, so the only possible reason is the blocked flag.
    expect(sampleBookings.filter((b) => b.roomId === 'r2')).toHaveLength(0);
    const res = checkAvailability(candidate, room('r2'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('blocked'))).toBe(true);
  });

  it('R5 AC4: an overlapping request is rejected', () => {
    const candidate: Interval = { start: 570, end: 630 };
    // b1 occupies 540-600, so 570-630 shares 570-600 with it.
    const res = checkAvailability(candidate, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('Overlaps existing booking'))).toBe(true);
  });

  it('R6 AC4: a request touching an existing booking only at an endpoint is accepted', () => {
    // b1 ends at 600 and b2 starts at 720: both candidates share only a boundary minute.
    const afterB1: Interval = { start: 600, end: 660 };
    const beforeB2: Interval = { start: 660, end: 720 };
    const first = checkAvailability(afterB1, room('r1'), freshBookings(), now);
    const second = checkAvailability(beforeB2, room('r1'), freshBookings(), now);
    expect(first.available).toBe(true);
    expect(first.reasons).toHaveLength(0);
    expect(second.available).toBe(true);
    expect(second.reasons).toHaveLength(0);
  });

  it('R7 AC5: the bookings fixture is unchanged by any of the calls above', () => {
    const bookings = freshBookings();
    const before = snapshot(bookings);
    // Mixed verdicts, including structurally invalid input, so a mutation would show up.
    checkAvailability({ start: 600, end: 660 }, room('r1'), bookings, now);
    checkAvailability({ start: 570, end: 630 }, room('r1'), bookings, now);
    checkAvailability({ start: 480, end: 540 }, room('r4'), bookings, now);
    checkAvailability({ start: 700, end: 600 }, room('r2'), bookings, now);
    checkAvailability({ start: 0, end: MINUTES_PER_DAY }, room('r5'), bookings, now);
    expect(bookings).toEqual(before);
    expect(bookings.length).toBe(before.length);
  });

  it('R8 the extracted predicate agrees with the rule it replaced', () => {
    // These inputs are exactly the ones the old inline App.tsx guard received, so the shared
    // function must classify them the same way checkAvailability's AC1 branch does.
    expect(isValidInterval(null)).toBe(false);
    expect(isValidInterval({ start: -1, end: 60 })).toBe(false);
    expect(isValidInterval({ start: 600, end: 1500 })).toBe(false);
    expect(isValidInterval({ start: 700, end: 700 })).toBe(false);
    expect(isValidInterval({ start: 0, end: MINUTES_PER_DAY })).toBe(true);
    expect(isValidInterval({ start: 600, end: 720 })).toBe(true);
    // An interval the predicate calls invalid must be what the checker calls a bad interval.
    for (const bad of [{ start: -1, end: 60 }, { start: 600, end: 1500 }, { start: 700, end: 600 }]) {
      const res = checkAvailability(bad, room('r1'), freshBookings(), now);
      expect(res.available).toBe(false);
      expect(res.reasons.some((r) => r.includes('0 ≤ start < end ≤ 1440'))).toBe(true);
    }
  });
});

// Practice #10, Tasks #07 and #08. These three cases guard the two risks that were mitigated in
// this practice. R9 and R11 fail on the checkpoint tree, which is what makes them regression
// guards rather than restatements of the old suite; R10 pins the parser that the App.tsx override
// guard depends on. No assertion above this line was changed.
describe('regression after the Practice #10 mitigations', () => {
  it('R9 AC3/AC4: an unresolved room is refused instead of answered Available', () => {
    const candidate: Interval = { start: 600, end: 660 };
    const res = checkAvailability(candidate, undefined, freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons).toHaveLength(1);
    expect(res.reasons[0]).toContain('Room could not be found');
    // The same interval in a real room is still available, so the new reason is about the room
    // and not about the interval.
    const inR1 = checkAvailability(candidate, room('r1'), freshBookings(), now);
    expect(inR1.available).toBe(true);
    expect(inR1.reasons).toHaveLength(0);
  });

  it('R10 the override guard input: an empty or out-of-range time does not parse to a number', () => {
    // The App.tsx guard is `useOverride && parseTimeToMinutes(currentTimeOverride) === null`,
    // so the value that used to reach `?? 0` has to stay unparseable.
    expect(parseTimeToMinutes('')).toBeNull();
    expect(parseTimeToMinutes('   ')).toBeNull();
    expect(parseTimeToMinutes('24:00')).toBeNull();
    expect(parseTimeToMinutes('16:40')).toBe(1000);
    expect(parseTimeToMinutes('9:00')).toBe(540);
  });

  it('R11 AC1: the past-time rule is clock-sensitive, which is why the 0 fallback was a risk', () => {
    const candidate: Interval = { start: 1000, end: 1060 }; // 16:40-17:40, free in r1
    const asMidnightClock = checkAvailability(candidate, room('r1'), freshBookings(), 0);
    const asEveningClock = checkAvailability(candidate, room('r1'), freshBookings(), 1320);
    expect(asMidnightClock.available).toBe(true); // what the old fallback produced
    expect(asEveningClock.available).toBe(false); // what the real clock produces
    expect(asEveningClock.reasons).toContain('Start time must be after the current time.');
  });
});
