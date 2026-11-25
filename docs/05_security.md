# Task #07 - Security review, Lecture #12 perspective

Scope: the two implementations of the same feature, run on 25 November 2026. No third-party service was
scanned, probed or fuzzed. The runtime checks below are the manual, in-browser kind that the slide calls
the DAST perspective, performed against the student's own published page and the local build only.

## Code-based track

### Input validation and output handling (injection / XSS)

The interface accepts exactly two values from a user, both `type="time"`, plus two checkboxes. There is no
free-text field, no search box and no URL parameter that reaches the DOM.

| Probe | Payload typed into Start time | What the input kept | Executable nodes added | Verdict |
| --- | --- | --- | --- | --- |
| X1 | `<img src=x onerror="window.__xss=1">` | empty string | 0, `window.__xss` never set | Unavailable, `E_BAD_FORMAT` |
| X2 | `09:30'; DROP TABLE bookings--` | empty string | 0 | Unavailable, `E_BAD_FORMAT` |
| X3 | `{{appsmith.store.x}}` | empty string | 0 | Unavailable, `E_BAD_FORMAT` |

The parser is a single anchored regex, `/^([01]?\d|2[0-3]):([0-5]\d)$/`, in `src/lib/availability.ts`, and
nothing is rendered from a string that did not pass it. React escapes text nodes, and the code contains no
`dangerouslySetInnerHTML`, no `eval`, no `new Function` and no `innerHTML` write; the only interpolated
output is a booking title taken from the fixture file, never from user input. Frames:
`screenshots/security_probes/X1_xss.png` to `X3_xss.png`, machine-readable observations in
`evidence/security_probes/`.

### Secrets, storage and data exposure

```
document.cookie                        -> ""            (length 0)
localStorage keys                      -> []
sessionStorage keys                    -> []
secret patterns in the built bundle    -> 0 matches for eyJ..., service_role, sk-...
```

There is no `.env` in the project, no authentication and no backend call: `@supabase/supabase-js` is a
declared dependency that no module imports, which is why the bundle still contains no URL or key. The data
is five fictional rooms and seven fictional bookings, no personal data. Verified in-page against the live
URL, `evidence/security_probes/S1_storage.json`.

### Dependencies, platform updates and hosting (SCA perspective)

`npm audit` exits 1 with 25 vulnerabilities (2 low, 7 moderate, 14 high, 2 critical) in the inherited tree.
They sit in the dev toolchain (vite 5.4.8 / vitest 2.1.9 era transitive deps) and none of them is reachable
at runtime in the published static page, because the shipped bundle contains only React, ReactDOM,
lucide-react and this app's own modules. `npm audit fix` was not run: it would move the Vite major version
under a build that has not been re-verified, which is the Lesson #07 rule that still applies. This is a
carried-forward risk from Practice #10, not a new one, and the owner of the repo has to decide the upgrade
window.

Hosting: GitHub Pages. Response headers on the live page are `Server: GitHub.com` and
`Strict-Transport-Security: max-age=31556952`. There is no Content-Security-Policy, no `X-Frame-Options`,
no `X-Content-Type-Options` and no `Referrer-Policy`, because a project Pages site cannot set them without a
custom domain plus `_headers`, which is not available on this host. For an app with no auth, no user input
beyond a time field and no stored data the exposure is low, but it is a real platform limit and it belongs
in the comparison matrix: the code-based track owns the headers problem and can currently do nothing about
it, while the low-code platform owns it instead and ships its own.

### Permissions and sharing

The repository is public by the brief's requirement. It contains no credentials, so "public" costs nothing
here; that is exactly the check the slide asks for, and it was made before publishing rather than assumed.
No connector, no API key and no service account is involved.

## Low-code track

Every probe below was run against the student's own published TeleportHQ project (URL owned by the account used
for this practice), on 25 November 2026. TeleportHQ's and Vercel's own infrastructure was not scanned, fuzzed or
brute-forced; the five wrong-password samples are self-tests on a project the student owns, and they are listed
because the absence of a lockout is a property of the demo, not an attack on the vendor. Evidence files live in
`evidence/security_probes_lowcode/`, and `lc_sec.js` in the tools folder reproduces the in-browser part.

### Input surface and injection

The published app exposes exactly three controls, and the harness enumerated them rather than assumed it:
`select#room-select` with the five fixed room captions, `input#start-datetime[type=datetime-local]` and
`input#duration-minutes[type=number]`. There is no text input, no textarea, no search box and no form element on
the page (`forms: 0`).

| Probe | Payload | What the control kept | Verdict from the runtime check |
| --- | --- | --- | --- |
| L1 | `<img src=x onerror=window.__xss=1>` offered to every text-capable control | the one match, `duration-minutes`, kept the empty string | `payload_in_dom: false`, `handler_fired: false`, `img_elements: 0`, DOM length 34474 before / 34464 after |

So there is no injection surface here, and the reason is the input types, not the student's care: a room can only
be one of five options the platform rendered, and a duration can only be a number. The verdict panel prints
fixed strings that the workflow chose, never a value the visitor typed. Frame:
`screenshots/lowcode/security_injection.png`, record: `P1_injection.json`.

### What the origin keeps about a visitor

```
document.cookie      -> ""   (the wall cookie is HttpOnly, see P3)
localStorage         -> nextauth.message  {"event":"session","data":{"trigger":"getSession"},...}
sessionStorage       -> []
links to login/auth/reset/admin in the rendered DOM -> []
```

The one storage key is the platform's own auth runtime, not something this project asked for. Recorded in
`P1_injection.json`.

### Platform code that stores a URL secret, found by reading the delivered page

The delivered HTML contains an inline script the project's editor never shows and the student did not write. It
is reproduced verbatim in `P4_platform_injected_script.txt`, 2287 characters, header comments
`tq-booking-key-keeper` and `tq-reset-token-keeper`. Its behaviour was confirmed at runtime: loading
`https://blaring-defensive-otter-8iwe1a.teleporthq.app/?key=SECRETPROBE123&ref=BK-ABCDEF12` leaves

```
landing_url    https://blaring-defensive-otter-8iwe1a.teleporthq.app/?ref=BK-ABCDEF12
sessionStorage tq-booking-key:BK-ABCDEF12 = "secretprobe123"
```

(`P2_url_secret_keeper.json`). The script lifts a credential out of the query string, lower-cases it, writes it
into `sessionStorage`, and then removes it from the address bar, so the secret disappears from the visible URL
while staying in the tab for the whole session, where any script on the origin can read it. Two of the scripts on
that origin come from a public CDN (next item). For this practice the app has no real credentials, so nothing was
leaked; the finding is that a low-code page can carry behaviour the builder cannot see, cannot review and cannot
remove from the visual editor, which is exactly the responsibility split the slide's SCA perspective asks about.

### Public sharing, permissions and the site password

The published page sits behind a platform-generated site password. Cookie-less `GET /` answers
`401 Unauthorized` with a `CampusCue - password required` interstitial, and the wall covers the whole path space,
not just the index: `/robots.txt`, `/login`, `/admin`, `/dashboard`, `/_next/data` all answer 401, while
`GET /api/site-password` answers 405. A correct `POST /api/site-password` sets

```
tq_wall=<64 hex>; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure
```

and the body is `{"ok":true}`; a wrong value returns 401, an empty body 400. Full header dumps are in
`P3_http_headers_and_gate.txt`.

The measured weakness: five consecutive wrong passwords returned 401 in 0.65 s to 1.29 s each with no `429`, no
`Retry-After` and no lockout page. Combined with a six-character password chosen by the platform and shown in
plaintext inside the publish dialog, and with no way to rotate or remove it on this plan (the Remove control is
present and disabled on the trial tier), the wall is a convenience, not an access control. The value is written
into `docs/04_lowcode_notes.md` and into the submission mail, so it must be treated as public. Nobody needs an
account to reach the demo, and nobody needs the project to be shared with them: the URL plus six characters is
the whole capability. There is no role model to test, because there is no per-user identity: one project, one
owner account, and every visitor is the same anonymous "someone with the password".

No connector, database, API key or OAuth credential was configured in this project, and none is referenced by
the delivered page: the external hosts reachable from the DOM are `fonts.googleapis.com`, `fonts.gstatic.com`,
`unpkg.com` and `play.teleporthq.io`. The workflow decides everything client-side, so no secret exists to leak,
and that is also why the availability answer cannot be trusted as an authoritative booking.

### Dependency and update responsibility

The published app is a Next.js build served by Vercel (`Server: Vercel`, `X-Vercel-Id` on every response). The
student sees pages and workflows, not a manifest: 43 JavaScript chunks are delivered, none of them named in the
builder, and the project cannot be exported at all once it became dynamic. The platform's own export dialog copy,
read out of the bundle it serves to every visitor, states the rule:

```
"Once a data source is added to your project, the project becomes a dynamic application that requires
 server-side rendering."
"Code export and download will be limited to Next.js framework only."
"In exchange, code download is no longer available (deployment from TeleportHQ still works), the choice is
 permanent, and the project needs its own <subscription>"
```

This project has a records collection (the workspace card reads `Bookings | Web App`), so it sits on the wrong
side of that rule, and `evidence/10_export_attempt.md` records the four routes tried and why each one stopped.
Updating React, Next or the platform runtime is the vendor's decision on the vendor's schedule, and it can change
the demo without any change on the student's side.

The delivered CSS bundle carries the same signature: its first block declares `Quill Editor v2.0.3`, a rich-text
editor this student never configured. The app is therefore built on dependencies that are invisible in the editor
and unpatchable from it.

The page also loads two third-party assets from a public CDN without Subresource Integrity:

```
<link rel="stylesheet" href="https://unpkg.com/animate.css@4.1.1/animate.css">
<link rel="stylesheet" href="https://unpkg.com/@teleporthq/teleport-custom-scripts@0.0.30/dist/style.css">
<script defer src="https://unpkg.com/@teleporthq/teleport-custom-scripts@0.0.30"></script>
occurrences of integrity= in the delivered document: 0
```

Version-pinned in the URL, not content-pinned, and executed on the project's own origin. The same script bundle
hosts the keeper function quoted above.

Response headers on the authenticated page are better than the code track's: `X-Content-Type-Options: nosniff`,
`Strict-Transport-Security: max-age=63072000`, `Referrer-Policy: strict-origin-when-cross-origin` and a
`Permissions-Policy` that closes camera, microphone and geolocation. Missing on both tracks: a
Content-Security-Policy and `X-Frame-Options`, so the demo can be framed by any site. The difference is who owns
the fix. On the code track the student owns the headers and has no place to set them on project Pages without a
custom domain. On the low-code track the vendor owns both the headers and the missing policy, and the builder
exposes neither.

### Lifetime of the published artefact

The workspace panel lists what happens when the trial lapses: `All deployments and custom domains will be
removed` and `All projects will be archived — no actions can be taken on them`, with the trial expiring
2 December 2026 (verbatim capture in `evidence/09_trial_terms_and_limits.txt`). So the low-code link in the
submission mail carries an expiry date the student does not control and cannot extend without paying, which the
brief forbids. The security consequence is mild, the deliverable consequence is not: after that date the app,
its change history and the only editable copy of it are unreachable, and the screenshots and the rendered HTML in
this pack are what survives. The code track's Pages deployment has no such term.

### Personal data on the published page, found and then removed from this pack

The requirement sheet says the scenario holds no personal data. The code track keeps that promise: its bundle
contains only fictional room and booking strings. The low-code page does not, and not because the student put
anything there.

Inside the delivered HTML of the published app, in a `application/ld+json` Organization block the platform
generated from the account:

```
"@type":"Organization","name":"CampusCue", ... "email":"<the owner's own address, redacted here>"
```

That is the owner's real address, served to every visitor who gets past the password wall, in machine-readable
form, on a page whose whole subject is fictional campus rooms. It is a genuine finding for this practice: the
visual builder filled in personal data that nobody asked for and nobody would think to delete, because it is not
a visible element on the canvas.

Handling: the address is redacted from `lowcode/export_from_site/published_index.html` before committing to the
public repository, together with three Google avatar URLs redacted from `evidence/11_lowcode_editor_snapshot.txt`
and two from `evidence/08_platform_access_log.txt`. `evidence/REDACTIONS.json` gives the original byte length and
the original sha256 of each file, so the redaction is auditable and the claim can be re-checked by anyone who
loads the live page. The live page itself was left as the platform published it, because editing generated
structured data is not possible on this plan and the practice is about what the platform does, not about what
would be convenient for the report.

### What was deliberately not done

No automated scanner was pointed at TeleportHQ or Vercel. No attempt was made to reach another account's project.
The password guesses were five samples against this project only, to measure the lockout behaviour rather than to
obtain access.

