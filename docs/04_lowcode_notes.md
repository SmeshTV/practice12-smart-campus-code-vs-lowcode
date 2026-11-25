# Task #04 - Low-code track: platform access log and the TeleportHQ build

Everything here was observed on 25 November 2026 in one session. Status codes, response bodies, panel labels
and token counters are quoted as they appeared. Nothing in this file is a plan or an impression unless it says
so.

## Part 1 - four platforms, what each one did to a student account

| Platform, named in the brief | What happened | Evidence |
| --- | --- | --- |
| Appsmith Cloud | Account created at `apps.appsmith.com/user/signup`. Every route (`/applications`, `/instance`, the editor URL the onboarding returned) redirects to `/license`: "Your instance is currently inactive. Please contact your instance administrator to reactivate the instance." Organisation "The Beasts", version `Appsmith v2.7.3-SNAPSHOT`, the signed-in user is not an administrator | `evidence/08_platform_access_log.txt`, section 1 (structural snapshot) |
| GlideOS | Not registered. The vendor's own pricing page lists Free: published apps 0, and puts "Publish public apps" under "Unlock with Plus" at $50 per month. A free account cannot produce the live demo link the submission demands | `evidence/08_platform_access_log.txt`, section 2 (table read off the pricing page) |
| Budibase Cloud | Account created and signed in. The tenants list was empty and the "Add a tenant" wizard would not advance, its Continue button keeping the class `is-disabled`. The documented request was sent directly: `POST /api/v2/tenant {"name":"kbtupractice12","id":"kbtupractice12","hosting":"cloud"}` answered `202 {"id":"kbtupractice12","status":"payment-pending"}`, and a minute later `GET /api/v2/tenant` still returned `[]` | `evidence/08_platform_access_log.txt`, section 3 (full request and answer sequence) |
| Glide Classic | `go.glideapps.com` refuses both paths. Email signup returns "Firebase: This operation is restricted to administrators only (auth/admin-restricted-operation)", and the same error appears after the Google button. The page still shows "Create your free account" afterwards | `screenshots/platform_access/glide_classic.png`, `evidence/08_platform_access_log.txt`, section 4 |

Self-hosting was also tried and is not available on this machine. `docker` is not installed, and WSL refuses to
start the distro:

```
WSL2 не поддерживается текущей конфигурацией компьютера.
...
Код ошибки: Wsl/Service/CreateInstance/CreateVm/HCS/HCS_E_HYPERV_NOT_INSTALLED
```

The exact block, with `wsl -l -v`, is in `evidence/08_platform_access_log.txt`, section 5. Virtualisation is off
in the firmware, so a self-hosted Appsmith or Budibase is out of reach on this laptop too.

That is the honest state of "a visual app builder available to the student" on this laptop on this afternoon,
and it is why the fifth option below was used.

## Part 2 - TeleportHQ, the fifth option, which is also named in the brief

Plan: Trial, 7 days left, "Completely free - no credit card required", version reported in the editor.
Project name given by the platform: **CampusCue**, project id `blaring-defensive-otter-8iwe1a`.
Live URL: `https://blaring-defensive-otter-8iwe1a.teleporthq.app/`

### How it was built

| Step | Action | Measured |
| --- | --- | --- |
| 15:10:07 | One description submitted to the project generator, category "Bookings", 1089 characters, the contract sheet of `docs/01_contract.md` in the platform's words. Full text in `prompts/03_lowcode_implementation.md` | tokens before: 20.1k |
| 15:10 - 15:17 | Platform planned and built the project: pages `homepage`, `bookings` (Homepage, Custom Page ADMIN, Terms & Conditions), `authentication`, `admin-panel`, components `Navigation`, `RoomCheckerSection`, `Footer`, `Cookie Consent`, plus a `/book` catalogue built on its own Bookings module | 1 page generated on demand, 3 queued |
| 15:17 | First look at the result: the checker section had the five rooms, a start-time field, a duration field and a status panel, but "Check Availability" was an anchor and no rule was evaluated; the status panel always read `Available / ROOM_CLEAR` | inline scripts searched for `overlap`, `blocked`, `INTERVAL`: no rules found |
| 15:26 | Second prompt: implement the six acceptance criteria as an ordered rule set with the contract's reason codes. Full text in `prompts/04_lowcode_workflow.md` | tokens after: 13.3k, so about 6.8k spent |
| 15:29 | The platform replied: "Check Availability is now a real button, wired to your ordered validation rules and fictional timetable. The Verified Status panel updates its verdict, reason code, and message without changing booking data." It created a **Workflow** named "Compute Room Availability", visible in the platform's Workflows panel | the page now exposes `select#room-select`, `input#start-datetime`, `input#duration-minutes`, `button#check-availability-button` |
| 15:36 | Third prompt, a defect report: `E_START_NOT_FUTURE` rejects tomorrow 13:00 when the clock reads 15:52. Platform answer: "Failed to apply changes. No fix was applied because the reported time-only comparison was not found in the current workflow. Runtime behavior was not tested." then "The saved rule already compares the full datetime, so no fix was applied; runtime behavior remains untested." | `screenshots/lowcode/T1_lowcode.png` |

### What the eight rows actually did on the published site

The same runner that produced the code-track frames drives this one too, through the DevTools protocol, after
entering the site password. `evidence/matrix_lowcode/` holds one JSON per row, `screenshots/lowcode/` the
matching frame. Recorded in `docs/02_test_table.md`.

### What the platform could not do, stated plainly

| Requirement | Outcome |
| --- | --- |
| Publish without a password | Not available. The published site answers HTTP 401 and shows "This site is password protected". The panel offers "Password Protection - On" with a **Remove** button that is disabled and tagged PRO. So the demo link the submission asks for is only usable if the class also gets the generated site password, which is a platform decision, not a student one |
| Express the availability rules without code | Partly. The rules ended up inside the platform's Workflows feature, which is visual, but they were produced by the platform's own generator from a text prompt, not assembled by dragging steps. Nothing was hand-written by me, and nothing was hand-dragged either, which is the honest weakness of this track |
| Clock control for testing | None. There is no way to pin "now", so a row that is correct at 08:00 can fail at 16:00. The code track has an Override field for exactly this reason |
| Working on the project from a small screen | No. Below 767 px the editor prints "Your browser window is too narrow. Building capabilities are disabled", and the whole toolbar reduces to three viewport buttons. The built app is fine at 390 px, measured in `evidence/responsive_lowcode_390.json`; the builder is not, so the track cannot be demonstrated on a phone |
| Keeping the demo alive | No. The trial panel states: "All deployments and custom domains will be removed. All projects will be archived - no actions can be taken on them", full access until 2 December 2026. Subscribing is the only way to stop that, and the brief forbids buying a subscription |
| Export of the application | Not obtainable. The editor offers "Import Project (ZIP)" and "Upload UIDL" going in, and nothing coming out: the platform's own export dialog text says that once a data source is added, "code download is no longer available", the choice is "permanent", and it needs its own subscription. This project has a Bookings collection, so it is on that side of the rule. Four routes were tried and all four stopped, in `evidence/10_export_attempt.md`. What a visitor can take is the rendered page and one stylesheet, stored in `lowcode/export_from_site/` |
| Version control | The editor has Undo/Redo and a "Backups" panel; there is no commit history, no diff and no branch. The code track has git |
| Cost | The trial counts tokens: 20.1k before the wiring prompt and 13.3k after it. Two prompts consumed roughly a third of the balance, and the platform labels further purchases "Purchase tokens" |

### Defects open at the end of this practice

| ID | Defect | Status |
| --- | --- | --- |
| LC-1 | `E_START_NOT_FUTURE` is evaluated against the time of day, so a start on a later calendar day is rejected in the afternoon | open, the platform refused the fix and said its own rule "already compares the full datetime" while runtime behaviour disagrees |
| LC-2 | The published site is behind a generated password that cannot be removed on the trial plan | open, plan limitation |
| LC-3 | The generator produced pages the contract never asked for (authentication, admin panel, terms, cookie consent, a whole `/book` catalogue) | recorded, not fixed; it is part of the customization comparison |
