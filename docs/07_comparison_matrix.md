# Task #06 and #07 - Comparison matrix and recommendation

Two implementations of one frozen requirement set, built by one person on one machine on 25 November 2026.
Every cell below is either a number that can be re-derived from a file stamp, an exit code, an HTTP status or a
test record, or it is marked as an impression. Nothing is copied between columns.

| Dimension | Code-based track (React + TypeScript + Vite) | Low-code track (TeleportHQ, Trial plan) | Evidence |
| --- | --- | --- | --- |
| Setup to a running skeleton | 9 min, 14:03-14:12. Copy the inherited tree, `npm ci`, `npm test`, typecheck, lint, build, audit | 21 min of setup produced no skeleton at all: Appsmith inactive instance, GlideOS free plan publishes 0 apps, Budibase tenant `payment-pending`, Glide Classic `auth/admin-restricted-operation`. Self-hosting blocked by `HCS_E_HYPERV_NOT_INSTALLED` | `docs/00_baseline.md`, `evidence/01`, `02`, `08_platform_access_log.txt` |
| Implementation of the contract | 3 min of editing, 14:23-14:26: `reason_codes.ts`, `validation.ts`, matrix test, App wiring. 11 min more were spent writing the contract itself before any code | 26 min, 15:10:07-15:36, of which the platform spent the time: one 1089-character prompt built the pages, a second prompt built the Workflow, a third asked for the defect fix and was refused. Student actions: typing three prompts and reading results | `docs/03_code_changes.md`, `prompts/03`, `04`, `docs/04_lowcode_notes.md` part 2 |
| Debugging | 6 min, 14:15-14:21, and all of it on the test harness, not the app: verdict read before React rendered, End-time field located in a `div`. Both fixed, third run clean | 0 min of debugging by the student, because the defect is not reachable. LC-1 sits inside a Workflow the editor would not open in the available window, and the platform's own assistant answered "no fix was applied because the reported time-only comparison was not found in the current workflow. Runtime behavior was not tested." | `docs/03_code_changes.md`, `docs/04_lowcode_notes.md` LC-1, `ai_outputs/` |
| Testing | 10 min, 14:26-14:36: 8 UI rows, 44 automated cases, prove-by-breaking on two rules, live re-run after deploy. Machine cost under 1 min | 4 min, 15:44-15:47: the same 8 rows through the same driver. No unit test layer exists on the platform, so nothing is re-runnable after a vendor update | `docs/02_test_table.md`, `evidence/matrix_*`, `evidence/07_breaking_run.txt` |
| Acceptance tests passed | **8 of 8**, each with the contract's reason code | **1 of 8**. T1-T5 and T7 all returned `E_START_NOT_FUTURE`; T6 matched by accident; T8 passes at display level only | `evidence/matrix_final_code/`, `evidence/matrix_lowcode/` |
| Unresolved defects | none open. Carried: 25 `npm audit` findings in the dev toolchain, none reachable in the shipped bundle; no security headers available on project Pages | 3 open: LC-1 the clock rule, LC-2 the unremovable site password, LC-3 five pages the contract never asked for (authentication, admin panel, terms, cookie consent, a `/book` catalogue) | `docs/05_security.md`, `docs/04_lowcode_notes.md` |
| Review and change control | `git`. Two commits on a public repo, reviewable diff of 127 lines for this practice (`evidence/06_code_change_set.txt`), blame, branch, revert | The platform's Undo/Redo and a Backups panel. No diff, no commit, no branch, no revert to a named version, and no export: once the project has a data source the platform's own dialog says "code download is no longer available", "the choice is permanent", and it needs its own subscription | `evidence/06_code_change_set.txt`, `evidence/10_export_attempt.md` |
| What a visitor can take away | The whole source, from a public repository, forever | Rendered HTML (233,992 bytes) and one CSS file (53,245 bytes). `__NEXT_DATA__` is 207 bytes, no UIDL, no component tree, no source maps | `lowcode/export_from_site/` |
| Security ownership | The student owns the code and the dependencies and can patch either, but cannot set response headers on project Pages: only `Server: GitHub.com` and HSTS | The vendor owns the runtime, the framework, 43 delivered chunks, two unpkg scripts with no `integrity=` attribute, a Quill 2.0.3 editor inside the student's CSS, and an inline script that lifts `?key=` from the URL into `sessionStorage`. The student can see none of it and change none of it. In return the platform ships better headers: `nosniff`, HSTS 2 years, `Referrer-Policy`, `Permissions-Policy`; CSP and frame protection missing on both tracks | `docs/05_security.md`, `evidence/security_probes_lowcode/P1`-`P4` |
| Injection surface | Two `type="time"` fields and two checkboxes; all three payloads were refused by the input itself | One `select` with five fixed options, one `datetime-local`, one `number`; the payload was refused, `payload_in_dom: false`, `handler_fired: false`. Neither track has a free-text field, so neither has an XSS surface, and in both cases that is the input types doing the work | `evidence/security_probes/`, `evidence/security_probes_lowcode/P1_injection.json` |
| Personal data, which the brief forbids | None. The bundle holds only fictional room and booking strings | The owner's real email address, in a JSON-LD Organization block the platform generated from the account, served to every visitor past the wall and invisible on the canvas. Redacted from this pack, original hash recorded, live page left as published | `docs/05_security.md`, `evidence/REDACTIONS.json` |
| Access model for the demo | Public URL, no gate, anyone with the link can test it | Public URL plus a platform-generated six-character password shown in plaintext in the publish dialog, not rotatable and not removable on this plan. Five wrong guesses answered 401 in 0.65-1.29 s with no lockout and no `Retry-After` | `evidence/security_probes_lowcode/P3_http_headers_and_gate.txt` |
| Behaviour under change | Add a rule: edit one pure function, run 44 tests, 3 minutes measured on this practice | Add a rule: describe it to the generator and hope the Workflow matches. The one change actually requested here was refused | `docs/03_code_changes.md`, `docs/04_lowcode_notes.md` |
| Usable on a narrow screen | Yes. 390 px frames for T1, T2, T6 and the initial view, no horizontal overflow | The built app: yes, measured at 390x844, `scrollWidth` 390, 0 overflowing elements, every control 44 px or taller. The builder: no, "Your browser window is too narrow. Building capabilities are disabled", minimum 767 px | `screenshots/code_final/*_narrow.png`, `evidence/responsive_lowcode_390.json`, `evidence/09_trial_terms_and_limits.txt` |
| Ongoing cost | Repository hosting and Pages are free and have no expiry. The student pays for the machine they already own | Trial ends 2 December 2026: "All deployments and custom domains will be removed. All projects will be archived - no actions can be taken on them." AI tokens metered, roughly 6.8k spent on the wiring prompt; the panel offers "Purchase Tokens" | `evidence/09_trial_terms_and_limits.txt`, `docs/04_lowcode_notes.md` |
| Machine time per test row | about 5 s end to end | about 15 s end to end, most of it waiting on the platform's own page to settle | the two runners in `evidence/tools/` |

## Measured versus impression

Measured: every interval, count, exit code, HTTP status, byte size, token figure and verdict string in the table.
The minute figures come from `stat` on the files named in the Evidence column, and the two runners print their own
timestamps inside the JSON records.

Impression, and labelled as such. The code track felt slower per feature at the start, because the contract had to
be written down before it could be enforced, and it felt faster at the end, because a rule change is a diff. The
low-code track felt almost magical for about seven minutes, between the first prompt and the moment the checker
appeared with the five rooms correctly listed, and then it stopped being usable at exactly the point where a real
decision was needed: the platform would not accept that its own rule was wrong, and there was no file to open to
disagree with it. The speed advantage low-code is supposed to have was real for the shell and zero for the
behaviour, which is the part the acceptance criteria are about. I also cannot claim a fair build-speed comparison
for the four platforms that refused the account; that cost is access, not effort.

## Recommendation, brief

Use the code-based track for anything whose rules have to be correct. It passed 8 of 8 with a machine-readable
reason code per row, it is versioned, it is reviewable, it has no expiry, and when a rule was wrong this
afternoon the fix took three minutes and 44 tests proved it.

Use a low-code platform when the deliverable is a form, a listing or a dashboard over data that already exists,
and when someone accepts that a vendor decides when the app changes. For this scenario it produced an attractive
interface in 26 minutes of typing and a wrong answer on 7 of 8 rows, and the wrongness was not fixable by the
person who owned the requirement.

If the two must be combined, the honest split is: low-code for the shell and the data entry, code for the rules
that carry the acceptance criteria, with the rule set exported as a shared contract, which is exactly what
`docs/01_contract.md` and `src/lib/reason_codes.ts` do here and what the platform gave no way to do.

One warning that belongs in the recommendation rather than in a footnote. The low-code demo link in this
submission stops working on 2 December 2026, when the trial lapses. The screenshots, the JSON records and the
rendered HTML in this pack are the durable evidence for that track, and they were taken first for that reason.
