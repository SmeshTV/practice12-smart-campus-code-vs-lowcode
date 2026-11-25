# Task #05 - The eight rows, run identically on both tracks

Every row was entered by hand in both interfaces with the same values and the same pinned clock (`now` =
09:00), in the same order, from the same sheet: `docs/01_contract.md`. Expected outcomes were written down
before either implementation was run, in Task #02.

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

| Row | Room | Start | Duration | Expected | Observed available | Observed reason code | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | r1 | 13:00 | 60 | Available, `OK` | not run yet | not run yet | - |
| T2 | r1 | 09:30 | 60 | Unavailable, `E_OVERLAP` | not run yet | not run yet | - |
| T3 | r2 | 10:00 | 60 | Unavailable, `E_BLOCKED` | not run yet | not run yet | - |
| T4 | r1 | 14:00 | 0 | Unavailable, `E_DURATION_ZERO_OR_NEGATIVE` | not run yet | not run yet | - |
| T5 | r1 | 14:00 | 121 | Unavailable, `E_DURATION_TOO_LONG` | not run yet | not run yet | - |
| T6 | r1 | 08:00 | 60 | Unavailable, `E_START_NOT_FUTURE` | not run yet | not run yet | - |
| T7 | r1 | 10:00 | 60 | Available, `OK` | not run yet | not run yet | - |
| T8 | r1 | 13:00 | 60 | bookings unchanged | not run yet | not run yet | - |

This column is filled only after the Appsmith app exists and the rows are entered in its own interface.
Anything that cannot be expressed on the platform is written into `docs/04_lowcode_notes.md` and marked
simulated or incomplete here rather than copied from the code track.
