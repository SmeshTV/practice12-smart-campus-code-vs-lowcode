# Task #02 - The common contract

One sheet, used for both tracks. The low-code build and the code-based build are given this page and
nothing else: same story, same six criteria, same inputs, same outputs, same eight test rows. This is
what makes the comparison in `docs/05_comparison_matrix.md` fair.

## User story

As a student, I select one campus room, a start time in the future and a duration, and the system tells
me whether that room is free, and if it is not, why. Nothing is booked and nothing is saved.

## Acceptance criteria, as printed on the practice slide

| AC | Criterion |
| --- | --- |
| AC1 | Start time must be in the future. |
| AC2 | Duration must be greater than zero and at most 120 minutes. |
| AC3 | Overlapping bookings are unavailable. |
| AC4 | Blocked room is unavailable. |
| AC5 | Display a clear decision without changing existing bookings. |
| AC6 | Invalid input receives understandable feedback. |

The inherited code tree labels the blocked-room rule AC3 and the overlap rule AC4, which is the opposite
of this slide. The slide wins for this practice, the comments in `src/lib/availability.ts` were corrected
to match it, and no rule text or test assertion changed. This is recorded as defect D1 in
`docs/03_code_changes.md`.

## Inputs

| Input | Type | Domain | Notes |
| --- | --- | --- | --- |
| `room` | id of one room | r1-r5 | one room is checked per request |
| `start` | HH:MM | 00:00-23:59 | must parse, must be in the future |
| `duration` | minutes | integer | must be 1-120 |
| `blocked` | boolean | per room | r2 is blocked in the fixtures |
| `bookings` | list of {room, start, end, title} | 7 fictional rows | never written to |
| `now` | HH:MM | 00:00-23:59 | the clock; pinned to 09:00 for every test row |

The interface takes a start time and an end time, or a start time and a duration; both are the same
input, and the duration form is what the shared test rows use.

## Outputs

Every request produces exactly one triple: `available` (boolean), `reason_code` (one value from the
table below) and `message` (the text a student reads).

| reason_code | available | message |
| --- | --- | --- |
| `OK` | true | Available |
| `E_START_NOT_FUTURE` | false | Start time must be after the current time. |
| `E_DURATION_ZERO_OR_NEGATIVE` | false | Duration must be greater than 0 minutes. |
| `E_DURATION_TOO_LONG` | false | Booking cannot be longer than 120 minutes. |
| `E_OVERLAP` | false | Overlaps existing booking "&lt;title&gt;" (&lt;start&gt;-&lt;end&gt;). |
| `E_BLOCKED` | false | This room is currently blocked and cannot be booked. |
| `E_BAD_FORMAT` | false | Please enter valid times in HH:MM format. |
| `E_ROOM_NOT_FOUND` | false | Room could not be found, so the request cannot be checked. |

Precedence, fixed so the two tracks cannot disagree: format, then room, then future time, then duration
bounds, then blocked, then overlap. Only the first failing code is reported.

## The eight test rows, prepared before implementation

`now` is 09:00 in every row. Room 101 holds b1 09:00-10:00 and b2 12:00-13:00; Room 102 is blocked.

| Row | Room | Start | Duration | Expected available | Expected reason_code |
| --- | --- | --- | --- | --- | --- |
| T1 | r1 | 13:00 | 60 | true | `OK` |
| T2 | r1 | 09:30 | 60 | false | `E_OVERLAP` |
| T3 | r2 | 10:00 | 60 | false | `E_BLOCKED` |
| T4 | r1 | 14:00 | 0 | false | `E_DURATION_ZERO_OR_NEGATIVE` |
| T5 | r1 | 14:00 | 121 | false | `E_DURATION_TOO_LONG` |
| T6 | r1 | 08:00 | 60 | false | `E_START_NOT_FUTURE` |
| T7 | r1 | 10:00 | 60 | true | `OK`, touching b1 at 10:00 is not an overlap |
| T8 | r1 | 13:00 | 60 | true | `OK`, and the seven bookings are byte-identical after the run |

T2 uses 09:30 + 60 minutes, which is 09:30-10:30 and overlaps b1. T6 uses 08:00, which is in the past at
a 09:00 clock. T8 is the AC5 check: the fixtures are re-read after every row and compared with the
snapshot taken before the run.

## What each track is allowed to use to satisfy this

Code-based: source code for the UI and for every rule. Low-code: visual components, bindings and
platform expressions; a small script is allowed only where the visual layer cannot express a rule, and
every such place has to be written down in `docs/04_lowcode_notes.md`.
