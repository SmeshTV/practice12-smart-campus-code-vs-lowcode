# Task #06 - Engineering effort, measured

Times are wall-clock intervals taken from file modification stamps and the timestamps printed inside the
evidence files, not from memory. The session ran on 25 November 2026 from 14:03 to the last entry shown here,
Almaty time. Every number below can be re-derived with `stat -c '%y %n' <file>` in the pack.

## Code-based track

| Phase | Measured interval | Minutes | What was actually happening |
| --- | --- | --- | --- |
| Setup and baseline freeze | 14:03 - 14:12 | 9 | reading the brief, copying the inherited tree, `npm test` at 14:11:45, typecheck/lint/build/audit at 14:12:03 |
| Contract and test rows | 14:12 - 14:23 | 11 | writing `docs/01_contract.md`, saved 14:22:51; the eight rows and the reason-code table were fixed before any new code |
| Implementation | 14:23 - 14:26 | 3 | `reason_codes.ts`, `validation.ts`, `practice12_matrix.test.ts`, App.tsx wiring; final gate at 14:26:02 |
| Debugging | 14:15 - 14:21 | 6, overlapping the two rows above | the test driver, not the app: the first matrix run read the verdict before React had rendered, so all eight rows reported `verdict: null`, and the End-time field was not found because it lives in a `div`, not a `label`. Both fixed, third run clean |
| Testing and verification | 14:26 - 14:36 | 10 | prove-by-breaking at 14:29:28 and 14:30:30, baseline diff at 14:29:16, Pages build and deploy 14:31-14:36, live re-run of T2 at 14:36 |
| Security review | 14:33 - 14:38 | 5 | three injection probes plus storage and bundle scan, `docs/05_security.md` saved 14:38:34 |

Sum of the phases, counting the overlap once: about 35 minutes of work, 14:03 to 14:38.

Machine time inside those phases, for scale: `npm test` 0.6s, typecheck, lint and build together under 10s,
one matrix row end to end about 5s, so the eight rows plus the narrow-screen pass cost under a minute. The
human part was the contract, the driver and the reading of results.

## Low-code track

| Phase | Measured interval | Minutes | Result |
| --- | --- | --- | --- |
| Appsmith Cloud | 14:39 - 14:44 | 5 | account created, workspace never activated, every route redirects to `/license` with "Your instance is currently inactive" |
| GlideOS pricing check | 14:44 - 14:46 | 2 | free plan publishes 0 apps, public apps unlock at $50 per month, rejected before signing up |
| Budibase Cloud | 14:46 - 14:55 | 9 | account created, tenant wizard button stayed `is-disabled`, direct API call returned `202 payment-pending`, `GET /api/v2/tenant` still `[]` |
| Glide Classic | 14:55 - 15:00 | 5 | email signup returns `Firebase: This operation is restricted to administrators only (auth/admin-restricted-operation)`; Google signup needs a popup that the embedded browser does not pass |

These minutes are real work that produced no app, and they belong in the comparison rather than being hidden:
on this machine, on a free student account, in one afternoon, four visual builders were tried and none of
them let the account through to a builder.

TeleportHQ, the fifth option named in the brief, is where the low-code app was actually built.

| Phase | Measured interval | Minutes | Result |
| --- | --- | --- | --- |
| Account and workspace | 15:00 - 15:10 | 10 | signed in, Trial plan, 7 days left, one project slot |
| Implementation | 15:10:07 - 15:17 | 7 | one 1089-character prompt produced pages, components, the room list and the timetable. No rule was evaluated: the check control was an anchor and the status panel always read `Available / ROOM_CLEAR` |
| Contract wiring | 15:26 - 15:29 | 3 | second prompt, 1564 characters, restating the six acceptance criteria and the reason codes. The platform created the Workflow "Compute Room Availability" and a real button. About 6.8k tokens spent |
| Defect repair attempt | 15:36 - 15:43 | 7 | defect report sent, "Failed to apply changes", then the editor surface stopped responding and the follow-up answer could not be typed anywhere. Nothing changed |
| Testing | 15:44 - 15:47 | 4 | the same eight rows through the same driver, against the published deployment |
| Security review and platform limits | 15:51 - 16:06 | 15 | four runtime probes, the HTTP gate probes, the narrow-screen measurement, the trial-terms capture and the export attempt |

Low-code total: 21 minutes reaching login screens, 46 minutes building, testing and reviewing, 67 minutes on the
track. Code track: 35 minutes, of which 11 were writing the contract that both tracks then shared.

The difference is not that one was slower. The code track's 35 minutes all produced something the student still
holds. Of the low-code 67, 21 produced nothing at all, 7 produced a shell, 3 produced a rule set the platform
itself had not run, and 7 were spent being told the rule set was already correct.

## Acceptance tests and open defects

| | Code-based | Low-code |
| --- | --- | --- |
| Rows passed | 8 of 8 | 1 of 8, and the one pass is T6, whose expected code the app returns for every row regardless of input |
| Unit/regression cases | 44 passed, 0 failed | none exist. The platform has no test runner, and the Workflow cannot be executed outside the page |
| Unresolved defects | none open; the inherited `npm audit` findings and the missing security headers are carried, both listed in the risk notes | LC-1 the clock rule, LC-2 the unremovable demo password, LC-3 the pages the contract never asked for. The four access failures above are not defects of this project, but they are why the low-code track has one implementation and not four |

## Measured versus impression

Measured: every interval in the three tables, every test count, every exit code, every HTTP status and response
body quoted in `docs/04_lowcode_notes.md`, the token figures the platform printed, and the byte sizes in
`lowcode/export_from_site/`.

Impression, labelled as such: the code track felt slower at the start, because the contract had to be written
before it could be enforced, and faster at the end, because a rule change is a diff. The low-code track felt
remarkably fast between 15:10 and 15:17, when a working-looking interface appeared out of one prompt, and then
felt like nothing at all from 15:36 onward, because there was no place to go and disagree. The usual claim that
low-code is quicker is only supportable here for the shell. For the behaviour the acceptance criteria are about,
the measured time to a correct answer was 3 minutes on the code track and no finite time on the low-code track.
