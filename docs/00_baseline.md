# Task #01 - Frozen baseline

Everything below was printed on 25 November 2026 in the folder
`Practice12_Nurmakhanbetov_Arman_24B031935`. Nothing in this section is a plan; each line names the
command that produced it, and the raw output is kept next to it in `evidence/`.

## What is being used as the code-based solution

The final code-based Smart Campus room availability checker from Practices #09 and #10. It was built
in Bolt.new (project `Smart Campus Room Availability Checker`, Version 9, Standard mode,
https://bolt.new/~/sb1-q4dwzvtc) and then refactored locally in those two practices. For this
practice the tree was copied unchanged into `code_based/` and the copy is what is measured.

| Item | Value | Where it was read |
| --- | --- | --- |
| App version in `package.json` | `0.0.0` (Bolt emits this and never bumps it) | `code_based/package.json` |
| Platform version | Bolt.new project "Version 9", plan shown as Standard, model behind Standard mode not disclosed by the UI | Practice #10 record, `Practice10_email_body.txt` |
| Framework | React 18.3, TypeScript 5.5, Vite 5.4.8, Tailwind 3.4, vitest 2.1.9 | `code_based/package.json` |
| Toolchain of the run | node v24.15.0, npm 11.6.2, Windows 11 build 26300 | `evidence/01_baseline_npm_test.txt`, `evidence/02_baseline_checks.txt` |
| Rule engine | `src/lib/availability.ts`, sha256 `f277d3c8...6da2ca3` | `sha256sum src/lib/availability.ts` |
| Booking fixtures | `src/lib/data.ts`, sha256 `b50d8276...0ea4ab` | `sha256sum src/lib/data.ts` |
| UI | `src/App.tsx`, sha256 `a167e4ca...42eb27` | `sha256sum src/App.tsx` |
| Tests as inherited | 2 files, 34 cases: `booking.test.ts` 23 + `regression.test.ts` 11 | `npm test` |
| Production bundle as inherited | `index-Drryqqq1.js` 157.48 kB, gzip 50.22 kB, built in 1.69s | `npm run build` |

## Booking data, frozen

Five fictional rooms, seven fictional bookings, no personal data, no login, no database. The checker
never writes: `useState(sampleBookings)` in `src/App.tsx:16` keeps the array, and no code path calls
`push`, `splice` or an assignment on it.

| Room | id | Building | Capacity | Blocked |
| --- | --- | --- | --- | --- |
| Room 101 | r1 | Engineering Block | 30 | no |
| Room 102 | r2 | Engineering Block | 24 | **yes** |
| Room 201 | r3 | Science Wing | 40 | no |
| Room 202 | r4 | Science Wing | 18 | no |
| Auditorium A | r5 | Main Hall | 120 | no |

| Booking | Room | Window | Title |
| --- | --- | --- | --- |
| b1 | r1 | 09:00-10:00 | Calculus Lecture |
| b2 | r1 | 12:00-13:00 | Physics Lab |
| b3 | r3 | 10:00-11:00 | Chemistry Seminar |
| b4 | r3 | 15:00-16:00 | Faculty Meeting |
| b5 | r4 | 08:00-09:00 | Morning Tutorial |
| b6 | r5 | 11:00-12:00 | Guest Lecture |
| b7 | r5 | 14:00-15:30 | Symposium |

The app works on minutes from 00:00 in one day, `MINUTES_PER_DAY = 1440`, `MAX_BOOKING_MINUTES = 120`.
Time is read from the device clock, with an Override field in the UI so a test can pin "now" to a
fixed value; that Override is what makes the eight cases below reproducible in the evening.

## Expected behaviour of the baseline, before any change

Recorded from the inherited rule engine, not assumed:

| Case | Input | Expected |
| --- | --- | --- |
| T1 | r1, 13:00-14:00, now 09:00 | Available |
| T2 | r1, 09:30-10:30, now 09:00 | Unavailable, overlaps b1 |
| T3 | r2, 10:00-11:00, now 09:00 | Unavailable, room blocked |
| T4 | r1, 14:00-14:00, now 09:00 | validation error, zero duration |
| T5 | r1, 14:00-16:01, now 09:00 | validation error, 121 minutes |
| T6 | r1, 08:00-09:00, now 09:00 | validation error, start not in the future |
| T7 | r1, 10:00-11:00, now 09:00 | Available, touching b1 at 10:00 is allowed |
| T8 | any of the above, then re-read the booking list | seven bookings unchanged |

## Baseline run, as executed

```
npm test                 -> 34 passed, 0 failed, 2 test files, exit 0
npm run typecheck        -> exit 0
npm run lint             -> exit 0
npm run build            -> exit 0, index-Drryqqq1.js 157.48 kB | gzip 50.22 kB
npm audit                -> exit 1, 25 vulnerabilities (2 low, 7 moderate, 14 high, 2 critical)
```

Raw output: `evidence/01_baseline_npm_test.txt`, `evidence/02_baseline_checks.txt`.

## Baseline behaviour observed in the running app

The eight cases were driven through the real interface, not through the unit tests, with the Override
clock pinned to 09:00. Driver: `evidence/tools/cdp_matrix_runner.js`, which attaches to Chrome over the DevTools
protocol, fills the actual inputs, clicks Check Availability and reads back the rendered verdict.

8 of 8 behaved as expected: T1 Available, T2 Unavailable with the overlap reason, T3 Unavailable with the
blocked reason, T4/T5/T6 Unavailable with the three validation messages, T7 Available, T8 the booking list
identical before and after. No horizontal overflow at 1440 px or at 390 px. Per-case frames are in
`screenshots/baseline_code/`, the machine-readable observation of each frame is in
`evidence/matrix_baseline_code/`.

## The rule that was followed

Task #01 says not to modify the booking rules to favour one approach. The baseline was therefore
measured first and completely: fixtures, expected behaviour, the five commands and the eight cases. The
only code changes made later in this practice are listed in `docs/03_code_changes.md`, none of them touch
an overlap test, a blocked-room test, a duration bound or the future-time rule, and the eight-case
observation was re-run after them to prove the numbers did not move.
