import type { Room, Booking, Interval, CheckResult } from './types';
import { MINUTES_PER_DAY, MAX_BOOKING_MINUTES } from './types';

// AC numbering, Lesson #12: AC3 is the overlap rule and AC4 is the blocked-room rule, as printed on the
// practice slide and written into docs/01_contract.md. Practices #09 and #10 labelled them the other way
// round, so the inherited test names in booking.test.ts and regression.test.ts still read AC3 for blocked
// and AC4 for overlap. Only the number written next to a rule moved; no rule text, message or assertion
// changed. Defect D1 in docs/03_code_changes.md.

// AC3: overlap test — touching endpoints allowed (so [a,b) and [b,c) don't overlap)
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

// AC1, structural half: an interval is well-formed when 0 <= start < end <= 1440.
// Practice #09: this rule used to live twice, here and inside App.tsx as a local arrow
// function. One exported pure predicate now owns it, so the checker and the UI cannot drift.
export function isValidInterval(candidate: Interval | null): candidate is Interval {
  return (
    candidate !== null &&
    candidate.start >= 0 &&
    candidate.end <= MINUTES_PER_DAY &&
    candidate.start < candidate.end
  );
}

export function checkAvailability(
  candidate: Interval,
  room: Room | undefined,
  bookings: Booking[],
  currentTimeMinutes: number
): CheckResult {
  const reasons: string[] = [];

  // Practice #10, mitigation M2 (risk R-02). Both room rules below are guarded on `room` being
  // defined, which is correct for a real room, but a call with room === undefined therefore skipped
  // AC3 and AC4 entirely and returned available: true with zero reasons. A missing room is now itself
  // a reason to refuse the check. The two room guards are deliberately left unchanged.
  if (!room) {
    reasons.push('Room could not be found, so the request cannot be checked.');
  }

  // AC1: 0 ≤ start < end ≤ 1440 and start after current time
  if (!isValidInterval(candidate)) {
    reasons.push('Interval must satisfy 0 ≤ start < end ≤ 1440 minutes.');
  } else {
    if (candidate.start <= currentTimeMinutes) {
      reasons.push('Start time must be after the current time.');
    }
  }

  // AC2: booking longer than 120 minutes
  if (candidate.end - candidate.start > MAX_BOOKING_MINUTES) {
    reasons.push('Booking cannot be longer than 120 minutes.');
  }

  // AC4: room blocked
  if (room && room.blocked) {
    reasons.push('This room is currently blocked and cannot be booked.');
  }

  // AC3: overlap with existing bookings for this room
  if (room) {
    const roomBookings = bookings.filter((b) => b.roomId === room.id);
    for (const b of roomBookings) {
      if (intervalsOverlap(candidate, b)) {
        reasons.push(`Overlaps existing booking "${b.title}" (${formatTime(b.start)}–${formatTime(b.end)}).`);
      }
    }
  }

  return { available: reasons.length === 0, reasons };
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseTimeToMinutes(value: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}
