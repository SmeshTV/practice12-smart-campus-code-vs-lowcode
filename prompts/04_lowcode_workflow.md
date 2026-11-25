# Prompt 04 - low-code track, second message to the TeleportHQ assistant

Target: the AI chat inside the CampusCue project editor, `play.teleporthq.io/projects/blaring-defensive-otter-8iwe1a/editor/...`.
Sent 25 November 2026 at 15:26 +0500. Length 1564 characters. Balance after the answer: 13.3k tokens, so this
prompt and its generation cost roughly 6.8k.

Purpose: make the platform express the six acceptance criteria of `docs/01_contract.md` as an ordered rule set
with the contract's reason codes. The data was restated inside the prompt because the generator had invented its
own booking titles on the first pass, and the contract's fixtures are frozen.

The text below is the message as the platform's own chat log renders it, taken from the accessibility tree in
`evidence/11_lowcode_editor_snapshot.txt`, element `uid=1_171`. It is not a paraphrase.

```
Wire the RoomCheckerSection so it actually computes availability. Requirements: the five rooms and their
bookings are the data; Room 102 is blocked for the whole day; bookings are Calculus Lecture 09:00-10:00 and
Physics Lab 12:00-13:00 in Room 101, Chemistry Seminar 10:00-11:00 and Faculty Meeting 15:00-16:00 in Room 201,
Morning Tutorial 08:00-09:00 in Room 202, Guest Lecture 11:00-12:00 and Symposium 14:00-15:30 in Auditorium A.
When the user presses Check Availability, evaluate in this order and show ONE result: if the start datetime is
missing or not parseable or the duration is missing, show Unavailable with reason code E_BAD_FORMAT and the
message Please enter valid times in HH:MM format.; if the start datetime is in the past, show Unavailable
E_START_NOT_FUTURE, Start time must be after the current time.; if duration is 0 or negative, show Unavailable
E_DURATION_ZERO_OR_NEGATIVE, Duration must be greater than 0 minutes.; if duration is greater than 120, show
Unavailable E_DURATION_TOO_LONG, Booking cannot be longer than 120 minutes.; if the selected room is blocked,
show Unavailable E_BLOCKED, This room is currently blocked and cannot be booked.; if the requested interval
overlaps a booking of that room on the same day, touching at an endpoint is allowed, show Unavailable E_OVERLAP
and name the booking with its times; otherwise show Available OK. Never modify the booking data. Update the
Verified Status panel: the verdict word, the Reason Code field and the message line. Make the Check Availability
control a real clickable button.
```

What the platform produced is in `ai_outputs/02_teleporthq_wiring_reply.txt`. The rule order, the code names and
the message strings were lifted from `src/lib/reason_codes.ts` in the code track, so both tracks were asked to
implement the same contract, not two descriptions of it.
