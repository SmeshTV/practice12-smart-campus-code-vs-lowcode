# Task #03 - The code-based solution: what was reused, what was changed

## Reused

The whole rule engine. `src/lib/availability.ts` still owns the overlap maths and the four booking rules,
`src/lib/data.ts` still holds the same five rooms and seven bookings, and the 34 inherited vitest cases were
kept exactly as they were. Nothing in the booking rules was touched to make the code track look better
against the low-code track.

## Changed, and why each one was required by this brief

| # | Change | Which task asked for it | Files |
| --- | --- | --- | --- |
| C1 | The three layers the brief names are now three modules: validation, availability calculation, UI display | Task #03 "Separate validation, availability calculation and UI display" | new `src/lib/validation.ts`, new `src/lib/reason_codes.ts`, `src/App.tsx` |
| C2 | A request now returns the triple defined by the contract: boolean, reason code, message | Task #02 "Define outputs: availability boolean, reason code and visible message" | `validation.ts`, `reason_codes.ts`, `App.tsx` |
| C3 | The eight shared rows are executable | Task #05 "Run identical tests" | new `src/lib/practice12_matrix.test.ts`, 10 cases |
| D1 | Comment numbering: the slide prints AC3 = overlap and AC4 = blocked, the inherited code had them swapped | Task #02, one contract for both tracks | `src/lib/availability.ts` comments, note added to `src/lib/booking.test.ts` |

D1 is a documentation defect, not a behaviour defect: no rule, message or assertion moved. The inherited
test names still read "AC3 (reject blocked room)" because renaming them would rewrite the record of
Practice #09 for no engineering gain; the note at the top of that file says which numbering each name uses.

## What deliberately did not change

- The five rooms and seven bookings.
- Every message string the baseline already printed. `E_BAD_FORMAT` reuses the exact old sentence
  "Please enter valid times in HH:MM format.", now sourced from `REASON_TEXT` instead of typed twice.
- The legacy `reasons[]` list. The new `message` is the contract's single primary reason; the list is still
  rendered underneath, because Practice #10 built it to show several simultaneous failures.
- Dependencies: nothing added, nothing removed, no `npm audit fix`.

## Before and after, same commands

```
npm test        baseline 34 passed, 2 files   ->  final 44 passed, 3 files
npm run typecheck   exit 0                    ->  exit 0
npm run lint        exit 0                    ->  exit 0
npm run build       index-Drryqqq1.js 157.48 kB, gzip 50.22 kB
                ->  index-Bp9-gzrV.js 158.95 kB, gzip 50.64 kB
npm audit           exit 1, 25 vulnerabilities ->  unchanged, see docs/04_security.md
```

Raw output: `evidence/01_baseline_npm_test.txt`, `evidence/02_baseline_checks.txt`, `evidence/05_code_final_gate.txt`.
Full source diff: `evidence/06_code_change_set.txt` (3 files changed, 3 files added, 127 diff lines).

## Prove-by-breaking, so the new assertions are known to bite

Two mutations, each reverted straight after the run, both recorded in `evidence/07_breaking_run.txt`.

| Mutation | Line | Result |
| --- | --- | --- |
| M1, AC2 bound loosened by one minute | `if (duration > MAX_BOOKING_MINUTES)` became `if (duration > MAX_BOOKING_MINUTES + 1)` in `validation.ts` | `1 failed \| 43 passed`, the failure is `T5: r1 840-961 -> Unavailable E_DURATION_TOO_LONG`, `expected true to be false` |
| M2, AC3 overlap made endpoint-inclusive | `a.start < b.end && b.start < a.end` became `a.start <= b.end && b.start <= a.end` in `availability.ts` | `12 failed`, among them `T1` and `T7` from the new rows plus the inherited "allows booking touching at endpoint" cases in both directions |

After both reverts the two files hash back to `991112b2...7d2577` and `fae3d916...b6df6c5`, the same values as
the final gate, and `npm test` prints `44 passed (44)`, exit 0. M1 bites only the new suite, which is exactly
what a shared-row test is for; M2 bites the new suite and the inherited one together, which is the regression
net doing its job.

## Responsive check, AC6

The same runner produced the frames at 1440 px and at 390 px with a mobile user agent. At 390 px the layout
stacks into one column, the verdict box, the code badge and the reason list stay inside the viewport, and
`document.documentElement.scrollWidth` equals `clientWidth` at 390, so there is no horizontal scrolling.
Frames: `screenshots/code_final/T1_code_final_narrow.png`, `T2_code_final_narrow.png`, `T6_code_final_narrow.png`.
