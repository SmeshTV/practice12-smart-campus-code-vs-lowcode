// Practice #12, Task #02/#03: the reason codes that both tracks must emit.
// This file is the machine-readable copy of the table in docs/01_contract.md.

export type ReasonCode =
  | 'OK'
  | 'E_BAD_FORMAT'
  | 'E_ROOM_NOT_FOUND'
  | 'E_OUT_OF_RANGE'
  | 'E_START_NOT_FUTURE'
  | 'E_DURATION_ZERO_OR_NEGATIVE'
  | 'E_DURATION_TOO_LONG'
  | 'E_BLOCKED'
  | 'E_OVERLAP';

export const REASON_TEXT: Record<ReasonCode, string> = {
  OK: 'Available',
  E_BAD_FORMAT: 'Please enter valid times in HH:MM format.',
  E_ROOM_NOT_FOUND: 'Room could not be found, so the request cannot be checked.',
  E_OUT_OF_RANGE: 'Times must be between 00:00 and 24:00.',
  E_START_NOT_FUTURE: 'Start time must be after the current time.',
  E_DURATION_ZERO_OR_NEGATIVE: 'Duration must be greater than 0 minutes.',
  E_DURATION_TOO_LONG: 'Booking cannot be longer than 120 minutes.',
  E_BLOCKED: 'This room is currently blocked and cannot be booked.',
  E_OVERLAP: 'Overlaps an existing booking in this room.',
};

// Fixed order, so the code-based and the low-code answer for the same row cannot diverge.
export const REASON_PRECEDENCE: ReasonCode[] = [
  'E_BAD_FORMAT',
  'E_ROOM_NOT_FOUND',
  'E_OUT_OF_RANGE',
  'E_START_NOT_FUTURE',
  'E_DURATION_ZERO_OR_NEGATIVE',
  'E_DURATION_TOO_LONG',
  'E_BLOCKED',
  'E_OVERLAP',
];
