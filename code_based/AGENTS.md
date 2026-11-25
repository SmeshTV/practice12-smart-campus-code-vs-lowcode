# AGENTS.md

## Project
Smart Campus room availability checker. One page, fictional sample data. React 18 + TypeScript + Vite +
Tailwind, tests with vitest 2.1.9 (declared as `^2.1.9`). A student picks a room and an interval and the page
answers Available or Unavailable with reasons. Nothing is saved.

## Structure
- src/App.tsx - page layout, form state and verdict display only; it calls validation.ts for the decision
- src/components/RoomCard.tsx - one room card
- src/components/Timeline.tsx - 24-hour bars for the bookings and the candidate interval
- src/lib/types.ts - Room, Booking, Interval, CheckResult, MINUTES_PER_DAY, MAX_BOOKING_MINUTES
- src/lib/data.ts - rooms and sampleBookings, fictional; five rooms r1-r5, seven bookings b1-b7
- src/lib/availability.ts - intervalsOverlap, isValidInterval, checkAvailability, formatTime, parseTimeToMinutes
- src/lib/reason_codes.ts - the ReasonCode union and the fixed precedence order (Practice #12 contract)
- src/lib/validation.ts - classify() and decideRequest(): one Decision = available + reason code + message
- src/lib/booking.test.ts - the acceptance-criteria tests, AC1-AC6, 23 cases
- src/lib/regression.test.ts - regression cases added in Practices #09 and #10, 11 cases
- src/lib/practice12_matrix.test.ts - the eight shared rows T1-T8 of docs/01_contract.md, 10 cases

## Accepted rules, behaviour that must not change
- AC1: accept only 0 <= start < end <= 1440, and start after the current time
- AC2: duration must be greater than 0 and at most 120 minutes
- AC3: reject overlaps; intervals that only touch at an endpoint are allowed
- AC4: reject a blocked room
- Lesson #12 numbers overlap as AC3 and blocked as AC4; the inherited test names in booking.test.ts and
  regression.test.ts still carry the Practice #09 labels. The rules themselves never changed.
- AC5: never mutate the booking data
- AC6: give clear feedback at desktop and at narrow mobile width

## Decisions that were open, now closed
- Room count: five rooms in `src/lib/data.ts`. The lesson text says "one room" meaning one room is
  selected per check; the catalog is part of the app since Practice #07. Do not cut it to one room.
- Current time: the device clock, `getCurrentMinutes()` in src/App.tsx. There is no campus timezone.
- `@supabase/supabase-js` is declared but never imported. It stays until the owner approves removing it;
  no agent may import it or add any other dependency.

## Commands
- npm install
- npm run dev
- npm test - three test files, 44 cases
- npm run test:matrix - only src/lib/practice12_matrix.test.ts, the eight shared rows
- npm run test:booking - only src/lib/booking.test.ts, 23 cases; it is not a full run
- npm run typecheck
- npm run lint
- npm run build
- npm run preview - serves the build from the previous command
- npm audit - currently exits 1 with 25 findings; see the risk register, do not run `npm audit fix`

## Acceptance gate
A change is accepted only when `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` all pass.
Report the command and its real output for each one. A result that was not executed in this turn is written as
"not run", never as "passed". AC6 is checked by hand at 1280 px and at 375 px: the verdict, the reasons and the
timeline must be readable with no horizontal scrolling, and the check is recorded with two screenshots.

## Forbidden scope changes
No login, no backend, no database, no Supabase calls, no booking creation or persistence, no new rooms and
no new features, no UI redesign, no dependency upgrades or removals, no new styling system. Data stays
fictional. No credentials in source or in any committed file; there is no `.env` in this project and
`.gitignore` keeps it out. No deployment, hosting or publishing without the owner asking for it.

## Review gates for an agent working here
- Show the diff and wait for approval before editing any file. Draft only, when the request says to wait.
- One change per request. Anything outside the named problem is rejected, including tidy-ups.
- Do not weaken or delete an existing assertion; add a test instead.
- Do not change the wording of an availability reason without saying so, because the tests match on it.
- Do not run destructive commands, do not push, do not publish, do not touch another project or a shared port.

## Engineering rules
Prefer pure functions and the smallest change that fixes the named problem. Use at most two design patterns
and only after a concrete problem is shown. Do not mutate the fixtures. Keep the responsive feedback working.
Report the changed files, the reason for each change and the test command output.
