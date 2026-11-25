# Prompt 05 - low-code track, the defect report the platform refused

Target: the same TeleportHQ assistant chat inside the CampusCue project. Sent 25 November 2026 at 15:36 +0500,
length 573 characters. This is the one repair attempt the low-code track got.

Why this wording: the eight rows had just been run against the published app and seven of them failed with
`E_START_NOT_FUTURE` on a start time that was demonstrably in the future, because the harness entered
2026-11-26 13:00 while the machine clock read 2026-11-25. The rule was therefore wrong, not the input. The
prompt names the symptom, states the correct comparison, and then lists everything that must not move, because
on this platform a repair request that does not fence the rest of the app is a request to rebuild the app.

Verbatim, as the platform's own chat log renders it (`evidence/11_lowcode_editor_snapshot.txt`, element
`uid=1_191`):

```
Defect fix in the availability check only. The E_START_NOT_FUTURE rule currently compares only the time of day with the current clock, so tomorrow 13:00 is wrongly rejected at 15:52. Compare the full start datetime with the current date and time instead: a start on a later calendar day is always in the future, and on the same day it must be later than now. Keep the room list, the booking data, the overlap rule that allows touching endpoints, the duration bounds 1 to 120, the blocked room rule and every reason code exactly as they are. Do not change any other section.
```

The answer is in `ai_outputs/03_teleporthq_defect_refusal.txt`. Nothing was changed, and the second sentence of
that answer contradicts the runtime behaviour the harness had just recorded eight times.

`docs/04_lowcode_notes.md` records this as defect LC-1, still open at submission. It is the single most
important comparison point in the practice: on the code track a wrong rule is a file you can open, edit and
prove with 44 tests, and on this low-code track a wrong rule is a sentence in a panel that says it is already
correct.
