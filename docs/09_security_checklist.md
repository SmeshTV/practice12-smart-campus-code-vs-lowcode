# Security checklist, Practice work #12

The brief asks for a security checklist alongside the review in `docs/05_security.md`. This is that checklist:
one line per question the Lecture #12 security slide raises, the answer for each track, and the file that proves
it. Nothing here is a plan or a recommendation, everything here is something that was actually looked at on
25 November 2026.

Legend: `yes` checked and passed, `no` checked and it does not hold, `n/a` the requirement does not apply to
this track, `open` checked and found broken.

## Injection and output handling

| # | Check | Code track | Low-code track | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Is there any free-text field the visitor can type into | no, two `type="time"` inputs and two checkboxes | no, one `select`, one `datetime-local`, one `number` | `evidence/security_probes/`, `evidence/security_probes_lowcode/P1_injection.json` |
| 2 | HTML/script payload offered to every text-capable control | refused by the input, kept as empty string | refused by the input, `payload_in_dom: false`, `handler_fired: false`, `img_elements: 0` | `X1` to `X3` frames, `P1_injection.json` |
| 3 | SQL-shaped payload | refused, `E_BAD_FORMAT` | not applicable, no text field | `evidence/security_probes/` |
| 4 | Template-expression payload | refused, `E_BAD_FORMAT` | not applicable | `evidence/security_probes/` |
| 5 | Any `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` in the shipped code | none | not inspectable, the builder shows no source | `docs/05_security.md` |
| 6 | Is user input ever rendered back | no, only fixed strings and booking titles from the frozen fixture | no, the verdict panel prints the workflow's own strings | both test tables |

## Permissions, sharing and access

| # | Check | Code track | Low-code track | Evidence |
| --- | --- | --- | --- | --- |
| 7 | Is the repository or project public | yes, by the brief's requirement, and it holds no credential | the project is `Public` in the platform panel, the deployment is behind a site password | `docs/05_security.md` |
| 8 | Can a stranger reach the demo | yes, link only, no gate | link plus a six-character platform-generated password | `P3_http_headers_and_gate.txt` |
| 9 | Does the gate cover deep paths | n/a | yes, `/robots.txt`, `/login`, `/admin`, `/dashboard`, `/_next/data` all answer 401 | `P3` |
| 10 | Rate limiting or lockout on the gate | n/a | no, five wrong guesses answered 401 in 0.65 to 1.29 s, no 429, no `Retry-After` | `P3` |
| 11 | Can the gate be removed or rotated by the owner | n/a | no, the Remove control is disabled and tagged PRO on this plan | `ai_outputs/04_teleporthq_publish_panel.txt` |
| 12 | Least privilege on the platform account | the repo has no deploy secret, Pages is published from a branch | one owner account, no shared workspace, no collaborator added | `docs/04_lowcode_notes.md` |
| 13 | Admin surface exposed | none exists | `/admin/dashboard` was generated and is published, no admin user was created, so nobody can sign in | `ai_outputs/04_teleporthq_publish_panel.txt` |

## Secrets, personal data and connectors

| # | Check | Code track | Low-code track | Evidence |
| --- | --- | --- | --- | --- |
| 14 | Secrets in the bundle | none, 0 matches for JWT, service-role or key patterns | none of the student's, the platform runtime is what ships | `evidence/security_probes/S1_storage.json` |
| 15 | `.env` or credential file in the repository | none | not applicable, no export exists | `evidence/10_export_attempt.md` |
| 16 | Cookies and browser storage written | none, `document.cookie` empty, both storages empty | one platform key `nextauth.message`, the wall cookie is `HttpOnly` | `P1_injection.json`, `P3` |
| 17 | Connector, API key or OAuth configured | none | none, and the platform asked for a Resend credential, it was refused | `ai_outputs/04_teleporthq_publish_panel.txt` |
| 18 | Personal data present, which the scenario forbids | none | found, the owner's own email in a JSON-LD Organization block the platform generated. Redacted in this pack, original hash recorded, live page left as published | `docs/05_security.md`, `evidence/REDACTIONS.json` |
| 19 | Does any script move a URL parameter into storage | no | yes, platform code stores `?key=` in `sessionStorage` and strips it from the address bar, reproduced live | `P2_url_secret_keeper.json`, `P4_platform_injected_script.txt` |

## Dependencies and platform updates, SCA

| # | Check | Code track | Low-code track | Evidence |
| --- | --- | --- | --- | --- |
| 20 | Dependency tree visible to the owner | yes, `package.json` plus lockfile | no, 43 delivered chunks and no manifest | `docs/06_effort.md` |
| 21 | Known-vulnerability scan | `npm audit` exits 1, 25 findings in the dev toolchain, none reachable in the static bundle | not runnable, and not the student's to run | `evidence/02_baseline_checks.txt` |
| 22 | Who can patch | the student, at a chosen time, with the risk that a major moves under an unverified build | the vendor only, on the vendor's schedule | `docs/05_security.md` |
| 23 | Third-party assets loaded by the running page | none beyond the bundle itself | `unpkg.com` twice, version-pinned, 0 `integrity=` attributes, plus a Quill 2.0.3 editor inside the site CSS | `P3`, `lowcode/export_from_site/README.txt` |

## Runtime checks performed the safe way, DAST

| # | Check | Done | Evidence |
| --- | --- | --- | --- |
| 24 | Manual probes through the real interface, not a scanner | yes, both tracks | `evidence/tools/README.md` |
| 25 | Anything scanned or fuzzed on a third-party service | no. The five password guesses were against this student's own project, and the platform API was never driven by a hand-built client | `evidence/10_export_attempt.md` section 3 |
| 26 | Response headers on the delivered page | code track: `Server: GitHub.com` and HSTS only. Low-code track: `nosniff`, HSTS two years, `Referrer-Policy`, `Permissions-Policy`. No CSP and no frame protection on either | `docs/05_security.md`, `P3` |
| 27 | Does the app mutate data during a check | code track: no, proved by the AC5 test and by the T8 before-and-after snapshot | `evidence/matrix_final_code/` |
| 28 | Same for the low-code app | open at display level only, the backing records cannot be read from outside | `docs/02_test_table.md` T8 |

## Open items at submission

| ID | What | Track |
| --- | --- | --- |
| LC-1 | Every future start is refused with `E_START_NOT_FUTURE`, so 7 of 8 rows fail. The platform declined the fix | low-code |
| LC-2 | The demo password cannot be removed or rotated on this plan, so the link is only as private as the mail that carries it | low-code |
| LC-3 | Pages the contract never asked for were generated: authentication, admin panel, terms, cookie consent, a `/book` catalogue | low-code |
| C-1 | 25 `npm audit` findings carried from Practice #10, none reachable in the published page | code |
| C-2 | No CSP and no frame protection, and project Pages gives no way to set them without a custom domain | code |
