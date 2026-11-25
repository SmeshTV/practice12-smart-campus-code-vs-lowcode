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

To be completed against the Appsmith build in `docs/04_lowcode_notes.md`: the same three payloads, the
sharing and visibility settings actually offered on the free plan, the workspace permissions a classmate
would get, the platform's own dependency and update responsibility, and whatever the published app URL
exposes. Not run yet, so nothing is claimed here.
