# Practice work #12 - Compare code-based and low-code solutions

Nurmakhanbetov Arman, 24B031935, Software Engineering, Lesson #12 / Practice 5.
Completed 25 November 2026, Almaty time.

One requirement sheet, two implementations of it, the same eight tests run against both, a security review of
both, and a comparison built from measurements rather than impressions.

Scenario: a Smart Campus Room Availability Checker for one fictional campus. A student picks a room and a future
start plus a duration, the system answers Available or Unavailable with a reason. No personal data, no login, no
payment, no production database, and no booking is ever confirmed.

## What is where

| The brief asks for | In this pack |
| --- | --- |
| Frozen baseline: version, booking data, expected behaviour, existing checks run, baseline screenshot | `docs/00_baseline.md`, `baseline_code/`, `evidence/01_baseline_npm_test.txt`, `evidence/02_baseline_checks.txt`, `screenshots/baseline_code/` |
| One shared requirements and acceptance-criteria sheet | `docs/01_contract.md` |
| Code-based solution, validation separated from calculation separated from display | `code_based/`, `docs/03_code_changes.md`, live at https://smeshtv.github.io/practice12-smart-campus-code-vs-lowcode/ |
| Low-code solution in a visual builder, same bookings and workflow | `lowcode/`, `docs/04_lowcode_notes.md`, live at https://blaring-defensive-otter-8iwe1a.teleporthq.app/ |
| Eight identical test cases, T1 to T8 | `docs/02_test_table.md`, `evidence/matrix_final_code/`, `evidence/matrix_lowcode/`, `screenshots/code_final/`, `screenshots/lowcode/` |
| Engineering-effort comparison, measured separated from impression | `docs/06_effort.md` |
| Security review with safe manual runtime checks | `docs/05_security.md`, `evidence/security_probes/`, `evidence/security_probes_lowcode/` |
| Comparison matrix and a brief recommendation | `docs/07_comparison_matrix.md` |
| Requirements the platform could not implement | `docs/04_lowcode_notes.md`, part 2, `evidence/09_trial_terms_and_limits.txt`, `evidence/10_export_attempt.md` |
| Security checklist and short AI-use reflection | `docs/09_security_checklist.md` and `docs/08_ai_reflection.md`, with the review behind them in `docs/05_security.md` |
| AI evidence appendix: tool and date, prompts, outputs used, decisions, human verification | `prompts/`, `ai_outputs/`, `evidence/REDACTIONS.json` |
| Screenshots of both implementations | `screenshots/` |
| Export of the low-code project | not obtainable, `evidence/10_export_attempt.md` explains the four routes tried; `lowcode/export_from_site/` holds what a visitor can actually take away |

## Labels the brief requires, applied here

Nothing in this pack is simulated, and three things are explicitly incomplete:

- LC-1, open. The low-code app refuses every future start with `E_START_NOT_FUTURE`, so 7 of 8 rows fail. The
  platform was asked to fix it, declined, and its own answer is quoted in `ai_outputs/03_teleporthq_defect_refusal.txt`.
- LC-2, open. The demo is behind a platform site password that cannot be removed on this plan. The value is
  printed in `ai_outputs/04_teleporthq_publish_panel.txt`, taken from the platform's own publish panel, and it is
  in the submission mail; without it the link is unusable.
- T8 on the low-code track is verified at display level only. The published app has no readable backing store from
  outside, so "bookings unchanged" means the rendered timetable is identical in all eight frames, not that the
  records were proven unmutated.

Also stated plainly: the low-code demo stops working on 2 December 2026, when the TeleportHQ trial lapses and the
platform removes deployments and archives projects. The screenshots and JSON records are the durable evidence for
that track.

## Reading order

`docs/00_baseline.md` first, because everything after it is measured against that frozen state. Then
`docs/01_contract.md`, which both implementations had to satisfy and which was written before either was touched.
Then `docs/02_test_table.md` for the results, `docs/03_code_changes.md` for how the code track got there,
`docs/04_lowcode_notes.md` for how the low-code track got where it is, `docs/05_security.md`, `docs/06_effort.md`,
`docs/07_comparison_matrix.md` for the answer, `docs/09_security_checklist.md` for the ticked list and
`docs/08_ai_reflection.md` for who did what.

## Reproducing the checks

Code track, Node 24:

    cd code_based
    npm ci
    npm test              # 44 cases
    npm run test:matrix   # the eight rows as assertions, 10 cases
    npm run dev

Both tracks, the eight rows through the real interfaces, see `evidence/tools/README.md`.

## Repository

https://github.com/SmeshTV/practice12-smart-campus-code-vs-lowcode
