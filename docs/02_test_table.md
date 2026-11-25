# Task #05 - The eight rows, run identically on both tracks

Every row was entered through each interface's own controls with the same values and the same intended clock
(`now` = 09:00), in the same order, from the same sheet: `docs/01_contract.md`. Expected outcomes were written
down before either implementation was run, in Task #02.

## Code-based track

Observed through the published page, `https://smeshtv.github.io/practice12-smart-campus-code-vs-lowcode/`,
with `evidence/tools/cdp_matrix_runner.js`. Each row has a frame in `screenshots/code_final/` and a machine
record in `evidence/matrix_final_code/`.

| Row | Room | Start | Duration | Expected | Observed available | Observed reason code | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | r1 | 13:00 | 60 | Available, `OK` | Available | `OK` | pass |
| T2 | r1 | 09:30 | 60 | Unavailable, `E_OVERLAP` | Unavailable | `E_OVERLAP` | pass |
| T3 | r2 | 10:00 | 60 | Unavailable, `E_BLOCKED` | Unavailable | `E_BLOCKED` | pass |
| T4 | r1 | 14:00 | 0 | Unavailable, `E_DURATION_ZERO_OR_NEGATIVE` | Unavailable | `E_DURATION_ZERO_OR_NEGATIVE` | pass |
| T5 | r1 | 14:00 | 121 | Unavailable, `E_DURATION_TOO_LONG` | Unavailable | `E_DURATION_TOO_LONG` | pass |
| T6 | r1 | 08:00 | 60 | Unavailable, `E_START_NOT_FUTURE` | Unavailable | `E_START_NOT_FUTURE` | pass |
| T7 | r1 | 10:00 | 60 | Available, `OK` | Available | `OK` | pass |
| T8 | r1 | 13:00 | 60 | bookings unchanged | 7 bookings identical before and after, `sampleBookings` deep-equals the snapshot | - | pass |

Same eight rows as executable assertions: `npm run test:matrix` prints `10 passed (10)`, and the full suite
is `44 passed (44)`.

The messages the app printed are the contract messages, character for character, for example T2:
`Overlaps existing booking "Calculus Lecture" (09:00-10:00).`

## Low-code track

Observed through the published TeleportHQ app, `https://blaring-defensive-otter-8iwe1a.teleporthq.app/`, with
`evidence/tools/lc_run.js` (same driver pattern: fill the page's own controls, click its own button, read the
verdict text out of the rendered DOM). Each row has a full-page frame in `screenshots/lowcode/` and a machine
record in `evidence/matrix_lowcode/`. All eight rows ran on 25 November 2026 between 15:44 and 15:47 +0500.

| Row | Room | Start | Duration | Expected | Observed available | Observed reason code | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Room 101 | 13:00 | 60 | Available, `OK` | Unavailable | `E_START_NOT_FUTURE` | **fail** |
| T2 | Room 101 | 09:30 | 60 | Unavailable, `E_OVERLAP` | Unavailable | `E_START_NOT_FUTURE` | **fail**, right verdict, wrong reason |
| T3 | Room 102 | 10:00 | 60 | Unavailable, `E_BLOCKED` | Unavailable | `E_START_NOT_FUTURE` | **fail**, wrong reason |
| T4 | Room 101 | 14:00 | 0 | Unavailable, `E_DURATION_ZERO_OR_NEGATIVE` | Unavailable | `E_START_NOT_FUTURE` | **fail**, wrong reason |
| T5 | Room 101 | 14:00 | 121 | Unavailable, `E_DURATION_TOO_LONG` | Unavailable | `E_START_NOT_FUTURE` | **fail**, wrong reason |
| T6 | Room 101 | 08:00 | 60 | Unavailable, `E_START_NOT_FUTURE` | Unavailable | `E_START_NOT_FUTURE` | pass |
| T7 | Room 101 | 10:00 | 60 | Available, `OK` | Unavailable | `E_START_NOT_FUTURE` | **fail** |
| T8 | Room 101 | 13:00 | 60 | bookings unchanged | timetable block byte-identical in all 8 frames, `7` rows for `5` rooms still listed | display-level only | pass with caveat |

Score: **1 of 8**. T1–T5, T7 and T8 were entered with the start date set to 2026-11-26, i.e. tomorrow relative
to the machine clock, so every one of them was genuinely in the future; the app refused all of them with
`E_START_NOT_FUTURE` anyway. T6 alone used 2026-11-24, a past date, and its code is therefore correct by
accident, which is why the row passes and nothing more. The single shared reason code across all eight rows is
the signature of defect LC-1 in `docs/04_lowcode_notes.md`: the platform's rule compares against a clock value
that no legal input can satisfy, so it fires first and no other rule is ever reached.

The label `RULE: INTERVAL_SAFE` printed above the verdict is static page text, not output from the workflow. It
read `INTERVAL_SAFE` in the pre-run frame (`evidence/matrix_lowcode/initial_lowcode.txt`) and in all eight
post-run frames, so it cannot be used as evidence of anything.

Two differences between the tracks are recorded rather than smoothed over. First, the code app exposes an
Override control, so the contract's pinned `now` = 09:00 could be reproduced exactly; the TeleportHQ app has no
such control and reads the real wall clock, so the same instant had to be reached through the date field.
Second, the code app takes a start time and derives the end; the low-code app takes a start date-time plus a
duration, which is the input shape the scenario brief actually describes, so the row values were converted
rather than typed identically.

T8 was not verifiable to the same standard as the code track. The published app has no writable store and the
harness cannot read the platform's data table from outside, so "unchanged" here means only that the rendered
timetable is identical in the frames before and after the seven requests. The deeper claim, that the backing
records were not mutated, is **unverified** for this track.


