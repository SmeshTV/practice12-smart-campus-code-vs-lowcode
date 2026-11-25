import type { Booking, Interval, Room } from './types';
import { MINUTES_PER_DAY, MAX_BOOKING_MINUTES } from './types';
import { formatTime, intervalsOverlap, parseTimeToMinutes } from './availability';
import { REASON_TEXT, type ReasonCode } from './reason_codes';

// Practice #12, Task #03: the three layers the brief asks for are now three files.
//   validation.ts  - this file: turns raw input into one decision (AC6 feedback, reason code)
//   availability.ts - the booking rules and the overlap maths, unchanged since Practice #10
//   App.tsx        - rendering only
// Nothing in here changes a rule: it re-expresses the same rules in the fixed precedence order of
// docs/01_contract.md so that a second implementation on another platform can be compared row by row.

export interface Decision {
  available: boolean;
  code: ReasonCode;
  message: string;
}

function decision(code: ReasonCode, message?: string): Decision {
  return { available: code === 'OK', code, message: message ?? REASON_TEXT[code] };
}

export function classify(candidate: Interval, room: Room | undefined, bookings: Booking[], now: number): Decision {
  if (!room) return decision('E_ROOM_NOT_FOUND');

  if (candidate.start < 0 || candidate.end > MINUTES_PER_DAY) return decision('E_OUT_OF_RANGE');

  if (candidate.start <= now) return decision('E_START_NOT_FUTURE');

  const duration = candidate.end - candidate.start;
  if (duration <= 0) return decision('E_DURATION_ZERO_OR_NEGATIVE');
  if (duration > MAX_BOOKING_MINUTES) return decision('E_DURATION_TOO_LONG');

  if (room.blocked) return decision('E_BLOCKED');

  const clash = bookings.find((b) => b.roomId === room.id && intervalsOverlap(candidate, b));
  if (clash) {
    return decision('E_OVERLAP', `Overlaps existing booking "${clash.title}" (${formatTime(clash.start)}-${formatTime(clash.end)}).`);
  }

  return decision('OK');
}

// The boundary the UI calls: raw HH:MM strings in, one Decision out.
export function decideRequest(
  rawStart: string,
  rawEnd: string,
  room: Room | undefined,
  bookings: Booking[],
  now: number
): Decision {
  const start = parseTimeToMinutes(rawStart);
  const end = parseTimeToMinutes(rawEnd);
  if (start === null || end === null) return decision('E_BAD_FORMAT');
  return classify({ start, end }, room, bookings, now);
}
